// 2. Create map.
const CANADA_BOUNDS = [[38, -150], [87, -45]];
const TORONTO = [43.6532, -79.3832];
const INITIAL_ZOOM = 10;

const POT_COLOUR_SCHEME = ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'];
const HIGH_RISK_COLOUR_SCHEME = ['#ffc4a7', '#fa9e95', '#f98378', '#f6577d', '#f32074', '#a81c6f', '#620147', '#2e012d'];
const COLOUR_SCHEME_THRESHOLDS = [0, 3, 7, 10, 15, 20, 25, 30];

// Create map
const map = new L.map('map', {
    'maxBounds': CANADA_BOUNDS,
    'center': TORONTO,
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

const postal_code_data = JSON.parse(data_postal_code_boundaries);
let confirmedCircles, selfIsolatedPolygons, highRiskPolygons, selfIso_legend, highRisk_legend;
let form_data_obj, confirmed_data;

function getColour(cases, colour_scheme) {
    if (COLOUR_SCHEME_THRESHOLDS.length !== colour_scheme.length)
        console.log("WARNING: list lengths don't match in getColour.");


    for (let i = 1; i < COLOUR_SCHEME_THRESHOLDS.length; i++) {
        if (cases <= COLOUR_SCHEME_THRESHOLDS[i]) return colour_scheme[i - 1];
    }

    return colour_scheme[COLOUR_SCHEME_THRESHOLDS.length - 1];
}

function displayMaps() {
    // 1. Create the layers

    // Array of Google Map API polygons for self-isolated and high-risk addresses.
    selfIsolatedPolygons = L.layerGroup();
    highRiskPolygons = L.layerGroup();

    // For each postal code in Canada.
    for (let fsa in postal_code_data) {
        if (!postal_code_data.hasOwnProperty(fsa)) continue;

        // 2. Get the number of reports.
        let num_potential = 0;
        let num_high_risk = 0;
        let total_reports_region = 0;
        if (fsa in form_data_obj['fsa']) {
            num_potential = form_data_obj['fsa'][fsa]['pot'];
            num_high_risk = form_data_obj['fsa'][fsa]['risk'];
            total_reports_region = form_data_obj['fsa'][fsa]['number_reports'];
        }

        // Get the colours.
        const colour_selfIso = getColour(num_potential, POT_COLOUR_SCHEME);
        const colour_highRisk = getColour(num_high_risk, HIGH_RISK_COLOUR_SCHEME);

        let opacity_selfIso = (num_potential === 0) ? 0 : 0.4;
        let opacity_highRisk = (num_high_risk === 0) ? 0 : 0.4;

        let msg_selfIso = "<h3>" + fsa + "</h3><p>We received " + num_potential + " reports from potential cases.</p><p>We received " + total_reports_region + " reports in total.</p>";
        let msg_highRisk = "<h3>" + fsa + "</h3><p>We received " + num_high_risk + " reports from vulnerable individuals.</p><p>We received " + total_reports_region + " reports in total.</p>";

        if (total_reports_region === 0) {
            msg_selfIso = "<h3>" + fsa + "</h3><p>We haven't had enough form responses in this region yet.</p>";
            msg_highRisk = "<h3>" + fsa + "</h3><p>We haven't had enough form responses in this region yet.</p>";
        }

        postal_code_data[fsa].forEach(function (datum) {
            const selfIsolatedPolygon = new L.Polygon(datum['coord'], {
                weight: 0.9,
                color: 'gray',
                dashArray: '3',
                fillColor: colour_selfIso,
                fillOpacity: opacity_selfIso,
            });

            const highRiskPolygon = new L.Polygon(datum['coord'], {
                weight: 0.9,
                color: 'gray',
                dashArray: '3',
                fillColor: colour_highRisk,
                fillOpacity: opacity_highRisk,
            });

            // Initialize infowindow text.
            selfIsolatedPolygon.bindPopup(msg_selfIso);
            highRiskPolygon.bindPopup(msg_highRisk);

            // Add polygons to polygon arrays and add click listeners.
            selfIsolatedPolygon.addTo(selfIsolatedPolygons);
            highRiskPolygon.addTo(highRiskPolygons);
        });
    }

    // Legend for self-isolated cases.
    selfIso_legend = L.control({position: 'bottomright'});

    selfIso_legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'info legend');
        /*  Loop through our density intervals and generate a label with a
            coloured square for each interval. */
        for (let i = 0; i < COLOUR_SCHEME_THRESHOLDS.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColour(COLOUR_SCHEME_THRESHOLDS[i] + 1, POT_COLOUR_SCHEME) + '"></i> ' +
                (COLOUR_SCHEME_THRESHOLDS[i]+1) + (COLOUR_SCHEME_THRESHOLDS[i + 1] ? '&ndash;' + COLOUR_SCHEME_THRESHOLDS[i + 1] + '<br>' : '+');
        }

        return div;
    };

    // Legend for high risk cases.
    highRisk_legend = L.control({position: 'bottomright'});

    highRisk_legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'info legend');
        // Loop through our density intervals and generate a label with a coloured square for each interval.
        for (let i = 0; i < COLOUR_SCHEME_THRESHOLDS.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColour(COLOUR_SCHEME_THRESHOLDS[i] + 1, HIGH_RISK_COLOUR_SCHEME) + '"></i> ' +
                (COLOUR_SCHEME_THRESHOLDS[i]+1) + (COLOUR_SCHEME_THRESHOLDS[i + 1] ? '&ndash;' + COLOUR_SCHEME_THRESHOLDS[i + 1] + '<br>' : '+');
        }

        return div;
    };

    // Array of Leaflet API markers for confirmed cases.
    confirmedCircles = L.layerGroup();

    const max_rad = 35;
    let confirmed_cases_data = confirmed_data['confirmed_cases'];
    for (let i = 0; i < confirmed_cases_data.length; i++) {
        if (confirmed_cases_data[i]['coord'][0] === "N/A") continue;

        // Add the marker.
        let rad = 5;
        if (confirmed_cases_data[i]['cases'] >= 10) {
            rad += confirmed_cases_data[i]['cases'] / confirmed_data['max_cases'] * max_rad;
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



