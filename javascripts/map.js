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

document.getElementById("postcode_mobile").innerHTML = "<center>Canada Numbers</center>";
document.getElementById("postcode").innerHTML = "<center>Canada Numbers</center>";

class MapConfig {
    constructor(layer, legend, polygons, style){
        this.layer = layer;
        this.legend = legend;
        this.polygons = polygons;
        this.style = style;
    }

    toggleOff(mainMap, fromCircle){
        if (this.legend) mainMap.removeControl(this.legend);
        if (fromCircle)
            mainMap.removeLayer(this.layer);
    }

    toggleOn(mainMap) {
        if (this.layer) this.layer.addTo(mainMap);
        if (this.legend) this.legend.addTo(mainMap);
        if (this.polygons) this.polygons.setStyle(this.style);
    }
}


// Map legends/layers for confirmed and potential cases, and the vulnerable.
let mapConfigs = {};

let polygons, confirmedCircles, polygonsLayer, selfIso_legend, highRisk_legend;
let form_data_obj, confirmed_data;

function getColour(cases, colour_scheme, thresholds) {
    if (thresholds.length !== colour_scheme.length)
        console.log("WARNING: list lengths don't match in getColour.");

    for (let i = 1; i < thresholds.length; i++)
        if (cases <= thresholds[i]) return colour_scheme[i - 1];

    return colour_scheme[thresholds.length - 1];
}

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

function displayMaps() {
    // Update dashboard
    function updateDash(postcode, layer) {
        let num_potential = 0;
        let num_high_risk = 0;
        let total_reports_region = 0;

        if (postcode in form_data_obj['fsa']) {
            num_potential = form_data_obj['fsa'][postcode]['pot'];
            num_high_risk = form_data_obj['fsa'][postcode]['risk'];
            total_reports_region = form_data_obj['fsa'][postcode]['number_reports'];
        }

        // Adjust postcode on dash
        document.getElementById("postcode_mobile").innerHTML = "<center>" + postcode + " Numbers</center>";
        document.getElementById("postcode").innerHTML = "<center>" + postcode + " Numbers</center>";

        // Adjust total responses
        document.getElementById("tot_res_mobile").innerHTML = total_reports_region;
        document.getElementById("tot_res").innerHTML = total_reports_region;

        // Adjust potential cases
        document.getElementById("pot_mobile").innerHTML = num_potential;
        document.getElementById("pot").innerHTML = num_potential;

        // Adjust total confirmed cases (to add)

        // Adjust current confirmed cases (to add)

        // Adjust vulnerable indidivudals
        document.getElementById("tot_vul_mobile").innerHTML = num_high_risk;
        document.getElementById("tot_vul").innerHTML = num_high_risk;

        // Adjust recovered individuals

        // Adjust popups
        let msg = "<h3>" + postcode + "</h3><p>We received " + num_potential +
            " reports from potential cases.</p><p>We received " + num_high_risk + " reports from vulnerable individuals.</p><p>We received "
            + total_reports_region + " reports in total.</p>";
        if (total_reports_region === 0) {
            msg = "<h3>" + postcode + "</h3><p>We haven't had enough form responses in this region yet.</p>";
        }

        layer.bindPopup(msg);
        layer.openPopup();
    }

    // Add self-isolation polygons
    polygons = L.geoJSON(post_code_boundaries, {
        style: selfIso_style,

        // Adding modals to each post code
        onEachFeature: function (feature, layer) {
            layer.on('click', function (e) {
                updateDash(feature.properties.CFSAUID, layer);
            });
        }

    });

    map.addLayer(polygons);

    // Add search bar
    var searchControl = new L.Control.Search({
        layer: polygons,
        propertyName: 'CFSAUID',
        marker: false,
        textPlaceholder: 'Enter first 3 digits of post code:',
        moveToLocation: function (latlng, title, map) {
            var zoom = map.getBoundsZoom(latlng.layer.getBounds());
            map.setView(latlng, zoom);
        }
    });

    searchControl.on('search:locationfound', function (e) {
        if (e.layer._popup)
            e.layer.openPopup();

        updateDash(e.text, e.layer);

    });

    map.addControl(searchControl);

    mapConfigs["potential"] = new MapConfig(polygonsLayer,
        L.control({ position: 'bottomright' }),polygons, selfIso_style);
    mapConfigs["vulnerable"] = new MapConfig(polygonsLayer,
        L.control({ position: 'bottomright' }), polygons, highRisk_style);

    // Legend for self-isolated cases.
    // mapConfigs["potential"].legend = L.control({ position: 'bottomright' });
    mapConfigs["potential"].legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'info legend');
        /*  Loop through our density intervals and generate a label with a
            coloured square for each interval. */
        for (let i = 0; i < POT_SCHEME_THRESHOLDS.length; i++)
            div.innerHTML +=
                '<i style="background:' + getColour(POT_SCHEME_THRESHOLDS[i] + 1, POT_COLOUR_SCHEME, POT_SCHEME_THRESHOLDS) + '"></i> ' +
                (POT_SCHEME_THRESHOLDS[i] + 1) + (POT_SCHEME_THRESHOLDS[i + 1] ? '&ndash;' + POT_SCHEME_THRESHOLDS[i + 1] + '<br>' : '+');

        return div;
    };

    // Legend for high risk cases.
    // mapConfigs["vulnerable"].legend = L.control({ position: 'bottomright' });
    mapConfigs["vulnerable"].legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'info legend');

        // Loop through our density intervals and generate a label with a coloured square for each interval.
        for (let i = 0; i < HIGH_RISK_SCHEME_THRESHOLDS.length; i++)
            div.innerHTML +=
                '<i style="background:' + getColour(HIGH_RISK_SCHEME_THRESHOLDS[i] + 1, HIGH_RISK_COLOUR_SCHEME, HIGH_RISK_SCHEME_THRESHOLDS) + '"></i> ' +
                (HIGH_RISK_SCHEME_THRESHOLDS[i] + 1) + (HIGH_RISK_SCHEME_THRESHOLDS[i + 1] ? '&ndash;' + HIGH_RISK_SCHEME_THRESHOLDS[i + 1] + '<br>' : '+');

        return div;
    };

    // Array of Leaflet API markers for confirmed cases.
    mapConfigs["confirmed"] = new MapConfig(L.layerGroup(), null, null, null);

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

        //Bind popup and add circle to circle array.
        circle.bindPopup(popup);
        circle.addTo(mapConfigs["confirmed"].layer);
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
    x.style.diplay = x.style.display === "block"? "none": "block";
}



