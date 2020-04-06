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
const CON_SCHEME_THRESHOLDS = [5, 25, 100, 250];
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

function create_legend(colorThrsholds, colourScheme) {
    let legend_content = '<i style="background:' + NOT_ENOUGH_GRAY + '"></i> ' + text.not_enough_data_legend + '<br>';

    // Loop through our density intervals and generate a label with a coloured square for each interval.
    if (colorThrsholds === CON_SCHEME_THRESHOLDS) {
        for (let i = 0; i < colourScheme.length; i++) {
            const threshold = i === 0 ? 0 : colorThrsholds[i - 1];
            legend_content +=
                '<i style="background:' + colourScheme[i] + '"></i>' + threshold + '+<br>';
        }
    } else {
        for (let i = 0; i < colourScheme.length; i++) {
            const threshold = i === 0 ? 0 : colorThrsholds[i - 1] * 100;
            legend_content +=
                '<i style="background:' + colourScheme[i] + '"></i> > ' + threshold + '%<br>';
        }
    }

    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = (map) => {
        const div = L.DomUtil.create('div', 'info legend');
        div.innerHTML = legend_content;

        return div;
    };

    return legend;
}

const tabs = {
    "confirmed": new Tab(create_legend(CON_SCHEME_THRESHOLDS, COLOUR_SCHEME), null, null, null),
    "vulnerable": new Tab(
        create_legend(HIGH_RISK_SCHEME_THRESHOLDS, COLOUR_SCHEME),
        null,
        create_style_function(COLOUR_SCHEME, HIGH_RISK_SCHEME_THRESHOLDS, 'risk'),
        "vuln"
    ),
    "potential": new Tab(
        create_legend(POT_SCHEME_THRESHOLDS, COLOUR_SCHEME),
        null,
        create_style_function(COLOUR_SCHEME, POT_SCHEME_THRESHOLDS, 'pot'),
        "pot"
    ),
    "pot_vul": new Tab(
        create_legend(BOTH_SCHEME_THRESHOLDS, COLOUR_SCHEME),
        null,
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
        if (post_code_data && data_tag in post_code_data) {
            const num_total = post_code_data['number_reports'];

            if (num_total > 25) {
                const num_cases = post_code_data[data_tag];

                if (num_cases === 0) {
                    opacity = 0;
                } else colour = getColour(num_cases / num_total, colour_scheme, thresholds);
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

    // Add search bar for polygons
    const searchControl = new L.Control.Search({
        layer: polygon_layer,
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

    const confirmed_layer = L.geoJSON(confirmed_data, {
        style: function (feature) {
            return {
                // define the outlines of the map
                weight: 0.9,
                color: 'gray',
                dashArray: '3',
                // define the color and opacity of each polygon
                fillColor: getColour(feature.properties.CaseCount, COLOUR_SCHEME, CON_SCHEME_THRESHOLDS),
                fillOpacity: POLYGON_OPACITY
            }
        },
        onEachFeature: function (feature, layer) {
            let popText = text['confirm_pop'];
            if (popText.includes("PLACEFR")) {
                popText = popText
                    .replace("PLACEFR", feature.properties.FRENAME)
                    .replace("CASES", feature.properties.CaseCount)
                    .replace("AAA", feature.properties.Last_Updated.replace("T", " ").replace(".000Z", ""));
                if (feature.properties.Deaths === null) {
                    popText = popText.replace("<br/>XXX décès", "");
                }
                if (feature.properties.Recovered === null) {
                    popText = popText.replace("<br/>YYY guérisons", "");
                }
                if (feature.properties.Tests === null) {
                    popText = popText.replace("<br/>ZZZ tests réalisés", "");
                }

                popText = popText.replace("XXX", feature.properties.Deaths)
                popText = popText.replace("YYY", feature.properties.Recovered)
                popText = popText.replace("ZZZ", feature.properties.Tests);
            } else {
                popText = popText
                    .replace("PLACE", feature.properties.ENGNAME)
                    .replace("CASES", feature.properties.CaseCount)
                    .replace("AAA", feature.properties.Last_Updated.replace("T", " ").replace(".000Z", ""));
                if (feature.properties.Deaths === null) {
                    popText = popText.replace("<br/>XXX deaths", "");
                }
                if (feature.properties.Recovered === null) {
                    popText = popText.replace("<br/>YYY recovered", "");
                }
                if (feature.properties.Tests === null) {
                    popText = popText.replace("<br/>ZZZ tests administered", "");
                }

                popText = popText.replace("XXX", feature.properties.Deaths)
                popText = popText.replace("YYY", feature.properties.Recovered)
                popText = popText.replace("ZZZ", feature.properties.Tests);
            }

            layer.bindPopup(popText);
        }
    });

    tabs.confirmed.map_layer = confirmed_layer;
    tabs.vulnerable.map_layer = polygon_layer;
    tabs.potential.map_layer = polygon_layer;
    tabs.pot_vul.map_layer = polygon_layer;

    tabs.confirmed.time_message = "";
    tabs.potential.time_message = "Total Responses: " + form_data_obj['total_responses'] + " | Last update: " + new Date(1000 * form_data_obj["time"]);
    tabs.vulnerable.time_message = tabs.potential.time_message;
    tabs.pot_vul.time_message = tabs.potential.time_message;
}

function toggle_clicked(radioValue) {
    tabs[radioValue].switch_to_tab(map);
}