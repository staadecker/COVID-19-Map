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
// max size circle can be on map
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

// toggles between polygons and circles
let confirmedCircles, selfIso_legend, highRisk_legend, layertest, polygons, searchControl_polygons, searchControl_circles;
// gets data from gcloud
let form_data_obj, confirmed_data;

// Text for popups and searchbar

// assigns color based on thresholds
function getColour(cases, colour_scheme, color_thresholds) {
    if (color_thresholds.length !== colour_scheme.length)
        console.log("WARNING: list lengths don't match in getColour.");


    for (let i = 1; i < color_thresholds.length; i++) {
        if (cases <= color_thresholds[i]) return colour_scheme[i - 1];
    }

    return colour_scheme[color_thresholds.length - 1];
}

// Coloring style for self-isolating polygons, feature is the specific polygon
function selfIso_style(feature) {
    let num_potential = 0;
    let num_total = 0;
    let excluded = false;

    // only set numbers if it exists in form_data_obj
    if (feature.properties.CFSAUID in form_data_obj['fsa']) {
        excluded = form_data_obj['fsa'][feature.properties.CFSAUID]['fsa_excluded'];
        if ('pot' in form_data_obj['fsa'][feature.properties.CFSAUID]) {
            num_potential = form_data_obj['fsa'][feature.properties.CFSAUID]['pot'];
        }
        num_total = form_data_obj['fsa'][feature.properties.CFSAUID]['number_reports'];
    }

    return {
        // define the outlines of the map
        weight: 0.9,
        color: 'gray',
        dashArray: '3',
        // define the color and opacity of each polygon
        fillColor: getColour(num_potential, POT_COLOUR_SCHEME, POT_SCHEME_THRESHOLDS),
        fillOpacity: (num_potential === 0) ? 0 : POLYGON_OPACITY,
    }
}

// Colouring style for high-risk polygons, feature is the specific polygon
function highRisk_style(feature) {
    let num_high_risk = 0;
    let num_total = 0;
    let excluded = false;

    if (feature.properties.CFSAUID in form_data_obj['fsa']) {
        excluded = form_data_obj['fsa'][feature.properties.CFSAUID]['fsa_excluded'];
        if ('risk' in form_data_obj['fsa'][feature.properties.CFSAUID]) {
            num_high_risk = form_data_obj['fsa'][feature.properties.CFSAUID]['risk'];
        }
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

// Adjusts popups on toggle
function adjustPopups(toggleType) {
    polygons.eachLayer(function (layer) {
        let num_potential = 0;
        let num_high_risk = 0;
        let total_reports_region = 0;
        let postcode = layer.feature.properties.CFSAUID;
        let excluded = false;

        if (postcode in form_data_obj['fsa']) {
            num_potential = form_data_obj['fsa'][postcode]['pot'];
            num_high_risk = form_data_obj['fsa'][postcode]['risk'];
            total_reports_region = form_data_obj['fsa'][postcode]['number_reports'];
            excluded = form_data_obj['fsa'][postcode]['fsa_excluded'];
        }

        let popuptxt_iso = potential_popup;
        let popuptxt_vul = vul_popup;
        let popuptxt_noEntires = noEntries_pop;
        let popuptxt_notSup = notSup_pop;

        if (num_potential === 1) {
            popuptxt_iso = potential_popup_1;
            popuptxt_vul = vul_popup_1;
        }

        popuptxt_iso = popuptxt_iso.replace("FSA", postcode);
        popuptxt_iso = popuptxt_iso.replace("XXX", num_potential);
        popuptxt_iso = popuptxt_iso.replace("YYY", total_reports_region);

        popuptxt_vul = popuptxt_vul.replace("FSA", postcode);
        popuptxt_vul = popuptxt_vul.replace("XXX", num_high_risk);
        popuptxt_vul = popuptxt_vul.replace("YYY", total_reports_region);

        popuptxt_noEntires = popuptxt_noEntires.replace("FSA", postcode);

        popuptxt_notSup = popuptxt_notSup.replace("FSA", postcode);

        if (toggleType === "selfIso") {
            if (excluded === true) {
                layer.setPopupContent(popuptxt_notSup);
            } else if (total_reports_region === 0) {
                layer.setPopupContent(popuptxt_noEntires);
            } else {
                layer.setPopupContent(popuptxt_iso);
            }
        } else {
            if (excluded === true) {
                layer.setPopupContent(popuptxt_notSup);
            } else if (total_reports_region === 0) {
                layer.setPopupContent(popuptxt_noEntires);
            } else {
                layer.setPopupContent(popuptxt_vul);
            }
        }
    });
}


function displayMaps() {
    // 1. Create the layers

    // Add self-isolation polygons
    polygons = L.geoJSON(post_code_boundaries, {
        //styles each polygons individually based on their features
        style: selfIso_style,

        // Adding modals to each post code
        onEachFeature: function (feature, layer) {
            let num_potential = 0;
            let total_reports_region = 0;
            let excluded = false;

            if (feature.properties.CFSAUID in form_data_obj['fsa']) {
                num_potential = form_data_obj['fsa'][feature.properties.CFSAUID]['pot'];
                total_reports_region = form_data_obj['fsa'][feature.properties.CFSAUID]['number_reports'];
                excluded = form_data_obj['fsa'][feature.properties.CFSAUID]['fsa_excluded'];
            }

            let popuptxt_iso = potential_popup;
            let popuptxt_noEntires = noEntries_pop;
            let popuptxt_notSup = notSup_pop;

            if (num_potential === 1) {
                popuptxt_iso = potential_popup_1;
            }

            popuptxt_iso = popuptxt_iso.replace("FSA", feature.properties.CFSAUID);
            popuptxt_iso = popuptxt_iso.replace("XXX", num_potential);
            popuptxt_iso = popuptxt_iso.replace("YYY", total_reports_region);

            popuptxt_noEntires = popuptxt_noEntires.replace("FSA", feature.properties.CFSAUID);

            popuptxt_notSup = popuptxt_notSup.replace("FSA", feature.properties.CFSAUID);


            if (excluded === true) {
                layer.bindPopup(popuptxt_notSup);
            } else if (total_reports_region === 0) {
                layer.bindPopup(popuptxt_noEntires);
            } else {
                layer.bindPopup(popuptxt_iso);
            }
        }
    });

    // Add search bar for polygons
    searchControl_polygons = new L.Control.Search({
        layer: polygons,
        propertyName: 'CFSAUID',
        marker: false,
        textPlaceholder: searchtext,
        autoCollapse: true,
        moveToLocation: function (latlng, title, map) {
            var zoom = map.getBoundsZoom(latlng.layer.getBounds());
            map.setView(latlng, zoom);
        }
    });

    searchControl_polygons.on('search:locationfound', function (e) {
        if (e.layer._popup)
            e.layer.openPopup();
    });

    map.addControl(searchControl_polygons);

    // Legend for self-isolated cases.
    selfIso_legend = L.control({ position: 'bottomright' });

    selfIso_legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'info legend');
        /*  Loop through our density intervals and generate a label with a
            coloured square for each interval. */
        for (let i = 0; i < POT_SCHEME_THRESHOLDS.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColour(POT_SCHEME_THRESHOLDS[i] + 1, POT_COLOUR_SCHEME, POT_SCHEME_THRESHOLDS) + '"></i> ' +
                (POT_SCHEME_THRESHOLDS[i] + 1) + (POT_SCHEME_THRESHOLDS[i + 1] ? '&ndash;' + POT_SCHEME_THRESHOLDS[i + 1] + '<br>' : '+');
        }

        return div;
    };

    // Legend for high risk cases.
    highRisk_legend = L.control({ position: 'bottomright' });

    highRisk_legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'info legend');
        // Loop through our density intervals and generate a label with a coloured square for each interval.
        for (let i = 0; i < HIGH_RISK_SCHEME_THRESHOLDS.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColour(HIGH_RISK_SCHEME_THRESHOLDS[i] + 1, HIGH_RISK_COLOUR_SCHEME, HIGH_RISK_SCHEME_THRESHOLDS) + '"></i> ' +
                (HIGH_RISK_SCHEME_THRESHOLDS[i] + 1) + (HIGH_RISK_SCHEME_THRESHOLDS[i + 1] ? '&ndash;' + HIGH_RISK_SCHEME_THRESHOLDS[i + 1] + '<br>' : '+');
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

        circle._leaflet_id = confirmed_cases_data[i].name;

        /*  Create the popup text and bind to the correct circle. Store popup
            index as a member of the popup so that we can set the popup to be
            in the centre of the circle on callback when clicked. */

        let cul_popuptxt = cul_popup;
        cul_popuptxt = cul_popuptxt.replace("PLACE", confirmed_cases_data[i].name);
        cul_popuptxt = cul_popuptxt.replace("CASES", confirmed_cases_data[i]['cases']);

        let popup = L.popup().setLatLng(confirmed_cases_data[i]['coord']).setContent(cul_popuptxt);
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



