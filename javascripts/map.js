// stays in Canada
const CANADA_BOUNDS = [[38, -150], [87, -45]];
// starts you in ontario
const ONTARIO = [51.2538, -85.3232];
const INITIAL_ZOOM = 5;

const HOSPITAL_MARKER_STYLE = {
    radius: 5,
    fillColor: "#3c88e6",
    color: "#000",
    weight: 0.5,
    opacity: 1,
    fillOpacity: 0.8
};

// Create map
const MAP_BASE_LAYER = new L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' +
        ' &copy;<a href="https://carto.com/attributions">CARTO</a> | ' +
        'Confirmed cases data from <a href="https://resources-covid19canada.hub.arcgis.com">ESRI</a>',
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

function create_legend(colourScheme, percent = true, not_enough_data = true) {
    let legend_content = "";

    if (percent) legend_content += text['percent_legend_title'];
    else legend_content += text['conf_legend_title'];

    if (not_enough_data)
        legend_content += '<i style="background:' + NOT_ENOUGH_GRAY + '"></i> ' + text.not_enough_data_legend + '<br>';

    // Loop through our density intervals and generate a label with a coloured square for each interval.
    for (let i = 0; i < colourScheme.colours.length; i++) {
        // Place square
        legend_content += '<i style="background:' + colourScheme.colours[i] + '"></i>';

        const threshold = i === 0 ? 0 : colourScheme.thresholds[i - 1];

        if (percent) legend_content += '> ' + threshold * 100 + '%<br>';
        else legend_content += '> ' + threshold + '<br>';
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
    "confirmed": new Tab({
        legend: create_legend(CONFIRMED_COLOUR_SCHEME, percent = false, not_enough_data = false)
    }),
    "vulnerable": new Tab({
        legend: create_legend(VULN_COLOUR_SCHEME),
        layer_style: create_style_function(VULN_COLOUR_SCHEME, 'risk'),
        popup_type: "risk"
    }),
    "potential": new Tab({
        legend: create_legend(POT_COLOUR_SCHEME),
        layer_style: create_style_function(POT_COLOUR_SCHEME, 'pot'),
        popup_type: "pot"
    }),
    "pot_vul": new Tab({
        legend: create_legend(BOTH_COLOUR_SCHEME),
        layer_style: create_style_function(BOTH_COLOUR_SCHEME, 'both'),
        popup_type: "both"
    })
};


// gets data from gcloud
let form_data_obj, confirmed_data, hospital_data;

function create_style_function(colourScheme, data_tag) {
    return (feature) => {
        let opacity = POLYGON_OPACITY; // If no data, is transparent
        let colour = NOT_ENOUGH_GRAY; // Default color if not enough data
        const post_code_data = form_data_obj['fsa'][feature.properties.CFSAUID];

        // only set numbers if it exists in form_data_obj
        if (post_code_data && data_tag in post_code_data) {
            const num_total = post_code_data['number_reports'];

            if (num_total > 25) {
                const num_cases = post_code_data[data_tag];

                if (num_cases === 0) opacity = 0;
                else colour = colourScheme.getColour(num_cases / num_total);
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
            const num_cases = post_code_data && post_code_data[tab.data_tag] ? post_code_data[tab.data_tag] : 0;

            switch (tab.data_tag) {
                case "pot":
                    message = (num_cases === 1 ? text.pot_case_popup_1 : text.pot_case_popup);
                    break;
                case "risk":
                    message = (num_cases === 1 ? text.vul_case_popup_1 : text.vul_case_popup);
                    break;
                case "both":
                    message = (num_cases === 1 ? text.pot_vul_popup_1 : text.pot_vul_popup);
                    break;
            }

            message = message
                .replace("FSA", post_code)
                .replace("XXX", num_cases)
                .replace("YYY", total_reports_region);
        }

        layer.setPopupContent(message);
    });
}


function styleConfirmedPolygons(feature) {
    const case_num = feature.properties['CaseCount'];

    return {
        // define the outlines of the map
        weight: 0.9,
        color: 'gray',
        dashArray: '3',
        // define the color and opacity of each polygon
        fillColor: CONFIRMED_COLOUR_SCHEME.getColour(case_num),
        fillOpacity: case_num === 0 ? 0 : POLYGON_OPACITY
    }
}

function createConfirmedPopups(feature, layer) {
    const prop = feature.properties;
    let popText = text.confirm_pop
        .replace("PLACE", lang === FRENCH ? prop['FRENAME'] : prop['ENGNAME'])
        .replace("CASES", prop['CaseCount']);

    if (prop['Deaths'] !== null) popText += text.confirm_pop_deaths.replace("XXX", prop['Deaths']);
    if (prop['Recovered'] !== null) popText += text.confirm_pop_recov.replace("XXX", prop['Recovered']);
    if (prop['Tests'] !== null) popText += text.confirm_pop_tests.replace("XXX", prop['Tests']);

    popText += text.confirm_pop_end
        .replace("XXX", prop['Last_Updated'])
        .replace("T", " ")
        .replace(".000Z", "");

    layer.bindPopup(popText);
}

function displayMaps() {
    // Add hospital layer
    const hospital_layer = L.geoJSON(hospital_data, {
        pointToLayer: function (feature, latlng) {
            const prop = feature['properties'];
            return L.circleMarker(latlng, HOSPITAL_MARKER_STYLE)
                .bindPopup(
                    "<b>" + prop['Name'] + "</b><p>"
                    + prop['Street'] + "<br/>"
                    + prop['City'] + ", " + prop['Prov'] + ", " + prop['Postal']
                );
        }
    });

    // Toggle for hospitals layer
    L.control.layers(null, {"Hospitals": hospital_layer}).addTo(map);

    // FORM DATA
    // Create a popup, color and text are initialized when the tab is create
    const form_layer = L.geoJSON(post_code_boundaries, {onEachFeature: (feature, layer) => layer.bindPopup()});

    // Add search bar for polygons
    const searchControl = new L.Control.Search({
        layer: form_layer,
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

    tabs.vulnerable.search_control = searchControl;
    tabs.potential.search_control = searchControl;
    tabs.pot_vul.search_control = searchControl;

    tabs.vulnerable.map_layer = form_layer;
    tabs.potential.map_layer = form_layer;
    tabs.pot_vul.map_layer = form_layer;

    const time = "Total Responses: " + form_data_obj['total_responses'] + " | Last update: " + new Date(1000 * form_data_obj["time"]);

    tabs.potential.time_message = time;
    tabs.vulnerable.time_message = time;
    tabs.pot_vul.time_message = time;

    // ESRI Data (Confirmed cases)
    tabs.confirmed.map_layer = L.geoJSON(confirmed_data, {
        style: styleConfirmedPolygons,
        onEachFeature: createConfirmedPopups
    });
}

function toggle_clicked(radioValue) {
    tabs[radioValue].switch_to_tab(map);
}
