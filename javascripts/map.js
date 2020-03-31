const CANADA_BOUNDS = [[38, -150], [87, -45]];
const ONTARIO = [51.2538, -85.3232];
const INITIAL_ZOOM = 5;

const POT_COLOUR_SCHEME = ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'];
const HIGH_RISK_COLOUR_SCHEME = ['#ffc4a7', '#fa9e95', '#f98378', '#f6577d', '#f32074', '#a81c6f', '#620147', '#2e012d'];
const POT_SCHEME_THRESHOLDS = [0, 5, 10, 50, 100, 200, 350, 500];
const HIGH_RISK_SCHEME_THRESHOLDS = [0, 5, 10, 50, 100, 200, 500, 700];
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

let confirmedCircles, selfIsolatedPolygons, highRiskPolygons, selfIso_legend, highRisk_legend;
let form_data_obj, confirmed_data;

function getColour(cases, colour_scheme, color_thresholds) {
    if (color_thresholds.length !== colour_scheme.length)
        console.log("WARNING: list lengths don't match in getColour.");


    for (let i = 1; i < color_thresholds.length; i++) {
        if (cases <= color_thresholds[i]) return colour_scheme[i - 1];
    }

    return colour_scheme[color_thresholds.length - 1];
}

function displayMaps() {
    // 1. Create the layers

    // Leaflet layerGroups to help with toggling
    selfIsolatedPolygons = L.layerGroup();
    highRiskPolygons = L.layerGroup();

    // Coloring style for self-isolating polygons, feature is the specific polygon
    function selfIso_style(feature) {
        let num_potential = 0;
        let num_total = 0;
        if (feature.properties.CFSAUID in form_data_obj['fsa']) {
            num_potential = form_data_obj['fsa'][feature.properties.CFSAUID]['pot'];
            num_total = form_data_obj['fsa'][feature.properties.CFSAUID]['number_reports'];
        }
        return {
            weight: 0.9,
            color: 'gray',
            dashArray: '3',
            fillColor: getColour(num_potential, POT_COLOUR_SCHEME, POT_SCHEME_THRESHOLDS),
            fillOpacity: (num_potential === 0) ? 0 : 0.4,
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
            fillOpacity: (num_high_risk === 0) ? 0 : 0.4,
        }
    }

    // Add self-isolation polygons
    L.geoJSON(post_code_boundaries, {
        style: selfIso_style,

        // Adding modals to each post code
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

    }).addTo(selfIsolatedPolygons);

    // Add high-risk polygons
    L.geoJSON(post_code_boundaries, {
        style: highRisk_style,

        // Adding modals to each post code
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

    }).addTo(highRiskPolygons);

    // Legend for self-isolated cases.
    selfIso_legend = L.control({position: 'bottomright'});

    selfIso_legend.onAdd = function (map) {
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
    highRisk_legend = L.control({position: 'bottomright'});

    highRisk_legend.onAdd = function (map) {
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
    confirmedCircles = L.layerGroup();

    let confirmed_cases_data = confirmed_data['confirmed_cases'];
    for (let i = 0; i < confirmed_cases_data.length; i++) {
        if (confirmed_cases_data[i]['coord'][0] === "N/A") continue;

        // Add the marker.
        let rad = 6;
        if (confirmed_cases_data[i]['cases'] >= 10) {
            rad += confirmed_cases_data[i]['cases'] / confirmed_data['max_cases'] * MAX_RAD;
        }

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

        //Bind popup and add circle to circle array.
        circle.bindPopup(popup);
        circle.addTo(confirmedCircles);
    }
}

// Sets the popup to be in the center of the circle when you click on it.
function onPopupOpen(event) {
    if (typeof (event.popup.popup_idx) != 'undefined')
        event.popup.setLatLng(confirmed_data['confirmed_cases'][event.popup.popup_idx]['coord']);
}

// Toggle numbers on mobile
function toggleStats() {
    var x = document.getElementById("myLinks");
    if (x.style.display === "block") {
    x.style.display = "none";
    } else {
    x.style.display = "block";
    }
}



