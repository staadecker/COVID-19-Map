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
const map = new L.map('map', {
    'maxBounds': canada_bounds
});
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

function displayMaps() {
    document.getElementById("update_time").innerHTML = confirmed_data['last_updated'];

    // Array of Google Map API polygons for self-isolated and high-risk addresse
    selfIsolatedPolygons = L.layerGroup();
    highRiskPolygons = L.layerGroup();

    for (let fsa in postal_code_data) {
        if (!postal_code_data.hasOwnProperty(fsa)) continue;

        let num_potential = 0;
        let num_high_risk = 0;
        if (fsa in form_data_obj['fsa']) {
            num_potential = form_data_obj['fsa'][fsa]['pot'];
            num_high_risk = form_data_obj['fsa'][fsa]['risk'];
        }

        const colour_selfIso = getColor_selfIso(num_potential);
        const colour_highRisk = getColor_highRisk(num_high_risk);

        let opacity_selfIso = 0.4;
        let opacity_highRisk = 0.4;

    let msg_selfIso = "<h3>" + fsa + "</h3><p>Received reports from " + num_potential + " potential cases</p>";
    let msg_highRisk = "<h3>" + fsa + "</h3><p>Received reports from " + num_high_risk + " vulnerable individuals</p>";

    if (num_potential === 0) {
        opacity_selfIso = 0;
        msg_selfIso = "<h3>" + fsa + "</h3><p>We haven't had enough form responses in this region yet.</p>";
    }

    if (num_high_risk === 0) {
        opacity_highRisk = 0;
        msg_highRisk = "<h3>" + fsa + "</h3><p>We haven't had enough form responses in this region yet.</p>";
    }

        for (let i = 0; i < postal_code_data[fsa].length; i++) {

            // Add the polygons.
            const selfIsolatedPolygon = new L.Polygon(postal_code_data[fsa][i]['coord'], {
                weight: 0.9,
                color: 'gray',
                dashArray: '3',
                fillColor: colour_selfIso,
                fillOpacity: opacity_selfIso,
            });
            const highRiskPolygon = new L.Polygon(postal_code_data[fsa][i]['coord'], {
                weight: 0.9,
                color: 'gray',
                dashArray: '3',
                fillColor: colour_highRisk,
                fillOpacity: opacity_highRisk,
            });


        //Initialize infowindow text
        selfIsolatedPolygon.bindPopup(msg_selfIso);
        highRiskPolygon.bindPopup(msg_highRisk);

            // Add polygons to polygon arrays and add click listeners.
            selfIsolatedPolygon.addTo(selfIsolatedPolygons);
            highRiskPolygon.addTo(highRiskPolygons);
        }
    }

    function getColor_selfIso(cases) {
        return cases > 1000 ? '#800026' :
            cases > 500 ? '#BD0026' :
                cases > 200 ? '#E31A1C' :
                    cases > 100 ? '#FC4E2A' :
                        cases > 50 ? '#FD8D3C' :
                            cases > 20 ? '#FEB24C' :
                                cases > 10 ? '#FED976' :
                                    '#FFEDA0';
    }

    function getColor_highRisk(cases) {
        return cases > 1000 ? '#2e012d' :
            cases > 500 ? '#620147' :
                cases > 200 ? '#a81c6f' :
                    cases > 100 ? '#f32074' :
                        cases > 50 ? '#f6577d' :
                            cases > 20 ? '#f98378' :
                                cases > 10 ? '#fa9e95' :
                                    '#ffc4a7';
    }

    //Legend for self-isolated cases
    selfIso_legend = L.control({position: 'bottomright'});

    selfIso_legend.onAdd = function (map) {

        const div = L.DomUtil.create('div', 'info legend'),
            grades = [1, 10, 20, 50, 100, 200, 500, 1000],
            labels = [];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor_selfIso(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    //Legend for high risk cases
    highRisk_legend = L.control({position: 'bottomright'});

    highRisk_legend.onAdd = function (map) {

        const div = L.DomUtil.create('div', 'info legend'),
            grades = [1, 10, 20, 50, 100, 200, 500, 1000],
            labels = [];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor_highRisk(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    // Array of Leaflet API markers for confirmed cases.
    confirmedCircles = L.layerGroup();

    const max_rad = 35;
    let confirmed_cases_data = confirmed_data['confirmed_cases'];
    for (let i = 0; i < confirmed_cases_data.length; i++) {
        //Add the marker
        if (confirmed_cases_data[i]['coord'][0] !== "N/A") {
            let rad;
            if (confirmed_cases_data[i]['cases'] < 10) {
                rad = 5;
            } else {
                rad = 5 + confirmed_cases_data[i]['cases'] / confirmed_data['max_cases'] * max_rad;
            }

            const circle = new L.circleMarker(confirmed_cases_data[i]['coord'], {
                weight: 0,
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.5,
                radius: rad
            });

            // create the popup text and bind to the correct circle.
            // store popup index as a member of the popup so that we can set the popup to be
            // in the centre of the circle on callback when clicked
            let text = "<h3>" + confirmed_cases_data[i].name + "</h3><p>" + confirmed_cases_data[i]['cases'] + " confirmed cases in this area</p>";
            let popup = L.popup().setLatLng(confirmed_cases_data[i]['coord']).setContent(text);
            popup.popup_idx = i;

            circle.bindPopup(popup);

            //Add circle to circle array
            circle.addTo(confirmedCircles);
        }
    }

    // Enable marker layer
    map.addLayer(confirmedCircles);
}

// sets the pop up to be in the center of the circle when you click on it
map.on("popupopen", function(event) {
    if(typeof(event.popup.popup_idx) != 'undefined') {
        event.popup.setLatLng(confirmed_data['confirmed_cases'][event.popup.popup_idx]['coord']);
    }
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
    await remoteConfig.fetchAndActivate();

    bucket = remoteConfig.getValue('bucket').asString();
    const bucket_reference = getGSBucketReference(bucket);
    form_data_obj = bucketRequest(await getGSDownloadURL(bucket_reference, 'form_data.json'));
    confirmed_data = bucketRequest(await getGSDownloadURL(bucket_reference, 'confirmed_data.json'));

    displayMaps();
    toggle_clicked(null);
}

// Calls the function
obtainAndDisplayMaps();

