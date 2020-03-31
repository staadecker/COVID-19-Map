// stays in Canada
const CANADA_BOUNDS = [[38, -150], [87, -45]];
// starts you in ontario
const ONTARIO = [51.2538, -85.3232];
const INITIAL_ZOOM = 5;

// white, yellow, orange, brown, red, black
const POT_COLOUR_SCHEME = ['#ffffb2', '#fecc5c', '#fd8d3c', '#f03b20', '#bd0026'];
const HIGH_RISK_COLOUR_SCHEME = ['#ffffb2', '#fecc5c', '#fd8d3c', '#f03b20', '#bd0026'];
const POT_SCHEME_THRESHOLDS = [0, 10, 50, 250, 500];
const HIGH_RISK_SCHEME_THRESHOLDS = [0, 50, 100, 300, 700];
const POLYGON_OPACITY = 0.4;
// Max size circle can be on map
const MAX_RAD = 35;

// Create map
const map = new L.map('map', {
    'maxBounds': CANADA_BOUNDS,
    'center': ONTARIO,
    'zoom': INITIAL_ZOOM,
    'layers': [
        new L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            minZoom: 4
        })
    ]
});

map.on("popupopen", onPopupOpen);

class MapConfig {
    constructor(){
        this.legend = null;
        this.layer = null;
    }

    toggleOff(mainMap){
        if (this.legend !== null) mainMap.removeControl(this.legend);
        if (this.layer !== null) mainMap.removeLayer(this.layer);
    }

    toggleOn(mainMap){
        this.layer.addTo(mainMap);

        if (this.legend === null) return confirmed_data['last_updated'];

        this.legend.addTo(mainMap);
        return "Total Responses: " + form_data_obj['total_responses'] + " | Last update: " + new Date(1000 * form_data_obj["time"]);
    }
}

// Map legends/layers for confirmed and potential cases, and the vulnerable.
let mapConfigs = {
    "confirmed": new MapConfig(),
    "vulnerable": new MapConfig(),
    "potential": new MapConfig(),
};


// Gets data from gcloud
let form_data_obj, confirmed_data;

// Assigns color based on thresholds
function getColour(cases, colour_scheme, color_thresholds) {
    if (color_thresholds.length !== colour_scheme.length)
        console.log("WARNING: list lengths don't match in getColour.");

    for (let i = 1; i < color_thresholds.length; i++)
        if (cases <= color_thresholds[i]) return colour_scheme[i - 1];

    return colour_scheme[color_thresholds.length - 1];
}


function displayMaps() {
    // 1. Create the layers

    // Leaflet layerGroups to help with toggling polygons in each layer group.
    mapConfigs["potential"].layer = L.layerGroup();
    mapConfigs["vulnerable"].layer = L.layerGroup();

    // Coloring style for self-isolating polygons, feature is the specific polygon.
    function selfIso_style(feature) {
        let num_potential = 0;
        let num_total = 0;

        // Only set numbers if it exists in form_data_obj.
        if (feature.properties.CFSAUID in form_data_obj['fsa']) {
            num_potential = form_data_obj['fsa'][feature.properties.CFSAUID]['pot'];
            num_total = form_data_obj['fsa'][feature.properties.CFSAUID]['number_reports'];
        }
        return {
            // Define the outlines of the map.
            weight: 0.9,
            color: 'gray',
            dashArray: '3',
            // Define the color and opacity of each polygon.
            fillColor: getColour(num_potential, POT_COLOUR_SCHEME, POT_SCHEME_THRESHOLDS),
            fillOpacity: (num_potential === 0) ? 0 : POLYGON_OPACITY,
        }
    }

    // Colouring style for high-risk polygons, feature is the specific polygon
    function highRisk_style(feature) {
        let num_high_risk = 0;
        let num_total = 0;
        if (feature.properties.CFSAUID in form_data_obj['fsa']) {
            num_high_risk = form_data_obj['fsa'][feature.properties.CFSAUID]['risk'];
            num_total = form_data_obj['fsa'][feature.properties.CFSAUID]['number_reports'];
        }
        return {
            weight: 0.9,
            color: 'gray',
            dashArray: '3',
            fillColor: getColour(num_high_risk, HIGH_RISK_COLOUR_SCHEME, HIGH_RISK_SCHEME_THRESHOLDS),
            fillOpacity: (num_high_risk === 0) ? 0 : POLYGON_OPACITY,
        }
    }

    // Add self-isolation polygons.
    L.geoJSON(post_code_boundaries, {
        //styles each polygons individually based on their features.
        style: selfIso_style,

        // Adding modals to each post code.
        onEachFeature: function (feature, layer) {
            let num_potential = 0;
            let total_reports_region = 0;
            if (feature.properties.CFSAUID in form_data_obj['fsa']) {
                num_potential = form_data_obj['fsa'][feature.properties.CFSAUID]['pot'];
                total_reports_region = form_data_obj['fsa'][feature.properties.CFSAUID]['number_reports'];
            }

            let msg_selfIso = "<h3>" + feature.properties.CFSAUID + "</h3><p>We received " + num_potential + " reports from potential cases.</p><p>We received " + total_reports_region + " reports in total.</p>";
            if (total_reports_region === 0) {
                msg_selfIso = "<h3>" + feature.properties.CFSAUID + "</h3><p>We haven't had enough form responses in this region yet.</p>";
            }

            layer.bindPopup(msg_selfIso);
        }

    }).addTo(mapConfigs["potential"].layer);

    // Add high-risk polygons.
    L.geoJSON(post_code_boundaries, {
        style: highRisk_style,

        // Adding modals to each post code.
        onEachFeature: function (feature, layer) {
            let num_high_risk = 0;
            let total_reports_region = 0;
            if (feature.properties.CFSAUID in form_data_obj['fsa']) {
                num_high_risk = form_data_obj['fsa'][feature.properties.CFSAUID]['risk'];
                total_reports_region = form_data_obj['fsa'][feature.properties.CFSAUID]['number_reports'];
            }

            let msg_highRisk = "<h3>" + feature.properties.CFSAUID + "</h3><p>We received " + num_high_risk + " reports from vulnerable individuals.</p><p>We received " + total_reports_region + " reports in total.</p>";
            if (total_reports_region === 0) {
                msg_highRisk = "<h3>" + feature.properties.CFSAUID + "</h3><p>We haven't had enough form responses in this region yet.</p>";
            }

            layer.bindPopup(msg_highRisk);
        }
    // Add to layer group.
    }).addTo(mapConfigs["vulnerable"].layer);

    // Legend for self-isolated cases.
    mapConfigs["potential"].legend = L.control({position: 'bottomright'});

    mapConfigs["potential"].legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'info legend');
        /*  Loop through our density intervals and generate a label with a
            coloured square for each interval. */
        for (let i = 0; i < POT_SCHEME_THRESHOLDS.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColour(POT_SCHEME_THRESHOLDS[i] + 1, POT_COLOUR_SCHEME, POT_SCHEME_THRESHOLDS) + '"></i> ' +
                (POT_SCHEME_THRESHOLDS[i]+1) + (POT_SCHEME_THRESHOLDS[i + 1] ? '&ndash;' + POT_SCHEME_THRESHOLDS[i + 1] + '<br>' : '+');
        }

        return div;
    };

    // Legend for high risk cases.
    mapConfigs["vulnerable"].legend = L.control({position: 'bottomright'});

    mapConfigs["vulnerable"].legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'info legend');
        // Loop through our density intervals and generate a label with a coloured square for each interval.
        for (let i = 0; i < HIGH_RISK_SCHEME_THRESHOLDS.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColour(HIGH_RISK_SCHEME_THRESHOLDS[i] + 1, HIGH_RISK_COLOUR_SCHEME, HIGH_RISK_SCHEME_THRESHOLDS) + '"></i> ' +
                (HIGH_RISK_SCHEME_THRESHOLDS[i]+1) + (HIGH_RISK_SCHEME_THRESHOLDS[i + 1] ? '&ndash;' + HIGH_RISK_SCHEME_THRESHOLDS[i + 1] + '<br>' : '+');
        }

        return div;
    };

    // Array of Leaflet API markers for confirmed cases.
    mapConfigs["confirmed"].layer = L.layerGroup();

    let confirmed_cases_data = confirmed_data['confirmed_cases'];
    for (let i = 0; i < confirmed_cases_data.length; i++) {
        if (confirmed_cases_data[i]['coord'][0] === "N/A") continue;

        // Add the marker.
        let rad = 6;
        if (confirmed_cases_data[i]['cases'] >= 10) 
            rad += confirmed_cases_data[i]['cases'] / confirmed_data['max_cases'] * MAX_RAD;

        const circle = new L.circleMarker(confirmed_cases_data[i]['coord'], {
            weight: 0,
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: rad
        });

        /*  Create the popup text and bind to the correct circle. Store popup
            index as a member of the popup so that we can set the popup to be
            in the centre of the circle on callback when clicked. */
        let text = "<h3>" + confirmed_cases_data[i].name + "</h3><p>" +
            confirmed_cases_data[i]['cases'] + " confirmed cases in this area</p>";

        let popup = L.popup().setLatLng(confirmed_cases_data[i]['coord']).setContent(text);
        popup.popup_idx = i;

        // Bind popup and add circle to circle array.
        circle.bindPopup(popup);
        circle.addTo(mapConfigs["confirmed"].layer);
    }
}

// Sets the popup to be in the center of the circle when you click on it.
function onPopupOpen(event) {
    if (typeof (event.popup.popup_idx) != 'undefined')
        event.popup.setLatLng(confirmed_data['confirmed_cases'][event.popup.popup_idx]['coord']);
}



