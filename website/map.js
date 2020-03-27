// 1. Load remote config
const remoteConfig = firebase.remoteConfig();
remoteConfig.settings = {
    minimumFetchIntervalMillis: 3600000,
};
remoteConfig.defaultConfig = ({
    'bucket': 'gs://flatten-271620.appspot.com',
    // 'bucket': 'gs://flatten-staging-271921.appspot.com',
});

var bucket;

// 2. Create map.
const canada_bounds = [[38, -150], [87, -45]];

const map = new L.map('map', {'maxBounds': canada_bounds});

const tiles = new L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    minZoom: 4
}).addTo(map);

map.setView([43.6532, -79.3832], 10);

instruction_page = document.getElementById("myModal3");
instruction_page.style.display = "block";

const postal_code_data = JSON.parse(data_postal_code_boundaries);
let confirmedCircles, selfIsolatedPolygons, highRiskPolygons, selfIso_legend, highRisk_legend;
let form_data_obj, confirmed_data;

function getColour_selfIso(cases) {
    return getColour(cases, ['#800026', '#BD0026', '#E31A1C', '#FC4E2A', '#FD8D3C', '#FEB24C', '#FED976', '#FFEDA0']);
}

function getColour_highRisk(cases) {
    return getColour(cases, ['#2e012d', '#620147', '#a81c6f', '#f32074', '#f6577d', '#f98378', '#fa9e95', '#ffc4a7']);
}

function getColour(cases, colours) {
    let thresholds = [1000, 500, 200, 100, 50, 20, 10, -1];
    for (let i = 0; i < Math.max(thresholds.length, colours.length); i++) {
        if (cases > thresolds[i]) return colours[i];
    }
    return colours[colours.length-1];
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
        const colour_selfIso = getColour_selfIso(num_potential);
        const colour_highRisk = getColour_highRisk(num_high_risk);

        let opacity_selfIso = (num_potential === 0) ? 0: 0.4;
        let opacity_highRisk = (num_high_risk === 0) ? 0: 0.4;

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
        const div = L.DomUtil.create('div', 'info legend'),
            grades = [1, 10, 20, 50, 100, 200, 500, 1000];

        /*  Loop through our density intervals and generate a label with a
            coloured square for each interval. */
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColour_selfIso(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    // Legend for high risk cases.
    highRisk_legend = L.control({position: 'bottomright'});

    highRisk_legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'info legend'),
        grades = [1, 10, 20, 50, 100, 200, 500, 1000];

        // Loop through our density intervals and generate a label with a coloured square for each interval.
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColour_highRisk(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
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
map.on("popupopen", function (event) {
    if (typeof (event.popup.popup_idx) != 'undefined')
        event.popup.setLatLng(confirmed_data['confirmed_cases'][event.popup.popup_idx]['coord']);
});

function getGSDownloadURL(bucket_reference, file) {
    return bucket_reference.child(file).getDownloadURL();
}

function bucketRequest(url) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send();
    return JSON.parse(xhr.responseText);
}

function getGSBucketReference(bucket) {
    try {
        const storage = firebase.storage();
        return storage.refFromURL(bucket);
    } catch (error) {
        console.log("Couldn't load firebase.storage. Please use 'firebase serve' to allow Google Cloud Storage Connection");
    }
}

async function obtainAndDisplayMaps() {
    try {
        await remoteConfig.fetchAndActivate();
    } catch (e) {
        console.log("Issue fetching remote config...");
    }

    bucket = remoteConfig.getValue('bucket').asString();
    const bucket_reference = getGSBucketReference(bucket);
    form_data_obj = bucketRequest(await getGSDownloadURL(bucket_reference, 'form_data.json'));
    confirmed_data = bucketRequest(await getGSDownloadURL(bucket_reference, 'confirmed_data.json'));

    displayMaps();
    toggle_clicked("potential");
}

// Calls the function.
obtainAndDisplayMaps();

