// stays in Canada
const CANADA_BOUNDS = [[38, -150], [87, -45]];
// starts you in ontario
const ONTARIO = [51.2538, -85.3232];
const INITIAL_ZOOM = 5;

// white, yellow, orange, brown, red, black
const COLOUR_SCHEME = ['#ffffb2', '#fecc5c', '#fd8d3c', '#f03b20', '#bd0026'];
const POT_SCHEME_THRESHOLDS = [0.02, 0.05, 0.1, 0.25];
const HIGH_RISK_SCHEME_THRESHOLDS = [0.15, 0.25, 0.35, 0.50];
const BOTH_SCHEME_THRESHOLDS = [0.01, 0.02, 0.05, 0.1];
const POLYGON_OPACITY = 0.4;
const NOT_ENOUGH_GRAY = '#909090';
// max size circle can be on map
const MAX_CIRCLE_RAD = 35;
const MIN_CIRCLE_RADIUS = 6;

// Create map
const MAP_BASE_LAYER = new L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    minZoom: 4
});

const map = new L.map('map', {
    'maxBounds': CANADA_BOUNDS,
    'center': ONTARIO,
    'zoom': INITIAL_ZOOM,
    'layers': [MAP_BASE_LAYER]
});

map.on("popupopen", function (event) {
    if (event.popup.coord) event.popup.setLatLng(event.popup.coord);
});


// Add search bar for polygons
const searchControl = new L.Control.Search({
    propertyName: 'CFSAUID',
    marker: false,
    textPlaceholder: text['searchbar'],
    autoCollapse: true,
    moveToLocation: (latlng, title, map) => {
        map.setView(latlng, map.getBoundsZoom(latlng.layer.getBounds()));
    }
});

searchControl.on('search:locationfound', (e) => {
    if (e.layer._popup) e.layer.openPopup()
});


function create_legend(colorThrsholds, colourScheme) {
    let legend_content = '<i style="background:' + NOT_ENOUGH_GRAY + '"></i> > ' + text.not_enough_data_legend + '<br>';

    // Loop through our density intervals and generate a label with a coloured square for each interval.
    for (let i = 0; i < colourScheme.length; i++) {
        const threshold = i === 0 ? 0 : colorThrsholds[i - 1] * 100;
        legend_content +=
            '<i style="background:' + colourScheme[i] + '"></i> > ' + threshold + '%<br>';
    }

    const legend = L.control({position: 'bottomright'});

    legend.onAdd = (map) => {
        const div = L.DomUtil.create('div', 'info legend');
        div.innerHTML = legend_content;

        return div;
    };

    return legend;
}

const tabs = {
    "confirmed": new Tab(null, null, null, null),
    "vulnerable": new Tab(
        create_legend(HIGH_RISK_SCHEME_THRESHOLDS, COLOUR_SCHEME),
        searchControl,
        create_style_function(COLOUR_SCHEME, HIGH_RISK_SCHEME_THRESHOLDS, 'risk'),
        "vuln"
    ),
    "potential": new Tab(
        create_legend(POT_SCHEME_THRESHOLDS, COLOUR_SCHEME),
        searchControl,
        create_style_function(COLOUR_SCHEME, POT_SCHEME_THRESHOLDS, 'pot'),
        "pot"
    ),
    "pot_vul": new Tab(
        create_legend(BOTH_SCHEME_THRESHOLDS, COLOUR_SCHEME),
        searchControl,
        create_style_function(COLOUR_SCHEME, BOTH_SCHEME_THRESHOLDS, 'both'),
        "pot_vul"
    )
};


// gets data from gcloud
let form_data_obj, confirmed_data;

// assigns color based on thresholds
function getColour(cases, colour_scheme, color_thresholds) {
    if (color_thresholds.length !== colour_scheme.length - 1)  // Minus one since one more color then threshold
        console.log("WARNING: list lengths don't match in getColour.");


    for (let i = 0; i < color_thresholds.length; i++) {
        if (cases < color_thresholds[i]) return colour_scheme[i];
    }

    return colour_scheme[colour_scheme.length - 1];
}

function create_style_function(colour_scheme, thresholds, data_tag) {
    return (feature) => {
        let opacity = POLYGON_OPACITY; // If no data, is transparent
        let colour = NOT_ENOUGH_GRAY; // Default color if not enough data
        const post_code_data = form_data_obj['fsa'][feature.properties.CFSAUID];

        // only set numbers if it exists in form_data_obj
        if (post_code_data && post_code_data[data_tag]) {
            const num_cases = post_code_data[data_tag];
            const num_total = post_code_data['number_reports'];

            if (num_total > 25) {
                if (num_cases === 0) opacity = 0;
                else colour = getColour(num_cases / num_total, colour_scheme, thresholds);
            }
        }

        return {
            // define the outlines of the map
            weight: 0.9,
            color: 'gray',
            dashArray: '3',
            // define the color and opacity of each polygon
            fillColor: colour,
            fillOpacity: opacity
        }
    }
}

// Adjusts popups on toggle
function adjustPopups(tab) {
    tab.map_layer.eachLayer(function (layer) {
        let message;

        const post_code = layer.feature.properties.CFSAUID;
        const post_code_data = form_data_obj['fsa'][(post_code)];

        const total_reports_region = post_code_data && post_code_data['number_reports'] ? post_code_data['number_reports'] : 0;
        const excluded = post_code_data && post_code_data['fsa_excluded'] ? post_code_data['fsa_excluded'] : false;

        if (excluded) message = text['notSupported_pop'].replace("FSA", post_code);
        else if (total_reports_region === 0) message = text['msg_noentries'].replace("FSA", post_code);
        else {
            switch (tab.popup_type) {
                case "pot":
                    const num_potential = post_code_data && post_code_data['pot'] ? post_code_data['pot'] : 0;
                    message = (num_potential === 1 ? text.pot_case_popup_1 : text.pot_case_popup)
                        .replace("FSA", post_code)
                        .replace("XXX", num_potential)
                        .replace("YYY", total_reports_region);
                    break;

                case "vuln":
                    const num_vulnerable = post_code_data && post_code_data['risk'] ? post_code_data['risk'] : 0;
                    message = (num_vulnerable === 1 ? text.vul_case_popup_1 : text.vul_case_popup)
                        .replace("FSA", post_code)
                        .replace("XXX", num_vulnerable)
                        .replace("YYY", total_reports_region);
                    break;

                case "pot_vul":
                    const num_both = post_code_data && post_code_data['both'] ? post_code_data['both'] : 0;
                    message = (num_both === 1 ? text.pot_vul_popup_1 : text.pot_vul_popup)
                        .replace("FSA", post_code)
                        .replace("XXX", num_both)
                        .replace("YYY", total_reports_region);
                    break;
            }
        }

        layer.setPopupContent(message);
    });
}


function displayMaps() {
    // 1. Create the layers

    // Create a popup, color and text are initialized when the tab is create
    const polygon_layer = L.geoJSON(post_code_boundaries, {
        onEachFeature: (feature, layer) => layer.bindPopup()
    });

    // Array of Leaflet API markers for confirmed cases.
    const confirmed_layer = L.layerGroup();

    const confirmed_cases_data = confirmed_data['confirmed_cases'];
    for (let confirmed_case of confirmed_cases_data) {
        if (confirmed_case['coord'][0] === "N/A") continue;

        // Add the marker.
        const circle = new L.circleMarker(confirmed_case['coord'], {
            weight: 0,
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: MIN_CIRCLE_RADIUS + confirmed_case['cases'] / confirmed_data['max_cases'] * MAX_CIRCLE_RAD
        });

        circle._leaflet_id = confirmed_case.name;

        /*  Create the popup text and bind to the correct circle. Store popup
            index as a member of the popup so that we can set the popup to be
            in the centre of the circle on callback when clicked. */

        const message = text['confirm_pop']
            .replace("PLACE", confirmed_case.name)
            .replace("CASES", confirmed_case['cases']);

        const popup = L.popup().setLatLng(confirmed_case['coord']).setContent(message);
        popup.coord = confirmed_case['coord'];

        //Bind popup and add circle to circle array.
        circle.bindPopup(popup);
        circle.addTo(confirmed_layer);
    }

    tabs.confirmed.map_layer = confirmed_layer;
    tabs.vulnerable.map_layer = polygon_layer;
    tabs.potential.map_layer = polygon_layer;
    tabs.pot_vul.map_layer = polygon_layer;

    tabs.confirmed.time_message = confirmed_data['last_updated'];
    tabs.potential.time_message = "Total Responses: " + form_data_obj['total_responses'] + " | Last update: " + new Date(1000 * form_data_obj["time"]);
    tabs.vulnerable.time_message = tabs.potential.time_message;
    tabs.pot_vul.time_message = tabs.potential.time_message;
}

function toggle_clicked(radioValue) {
    if (current_tab) current_tab.remove_from_map(map);
    tabs[radioValue].add_to_map(map);
}