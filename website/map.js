// Create map.
const map = new L.map('map').setView([43.6532, -79.3832], 10);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

document.getElementById("update_time").innerHTML = data_last_updated;
instruction_page = document.getElementById("myModal3")
instruction_page.style.display = "block";

// Load data files
postal_code_data = JSON.parse(data_postal_code_boundaries);
form_data_obj = JSON.parse(form_data);
confirmed_data = JSON.parse(data_confirmed);

// Array of Google Map API polygons for self-isolated and high-risk addresse
const selfIsolatedPolygons = L.layerGroup();
const highRiskPolygons = L.layerGroup();

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

    if (num_potential === 0) {
        opacity_selfIso = 0;
    }

    if (num_high_risk === 0) {
        opacity_highRisk = 0
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
        selfIsolatedPolygon.bindPopup("<h3>" + fsa + "</h3><p>Received reports from "
            + num_potential + " potential cases</p>");

        highRiskPolygon.bindPopup("<h3>" + fsa + "</h3><p>Received reports from " + num_high_risk + " vulnerable individuals</p>");

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
    return cases > 1000 ? '#0c2c84' :
        cases > 500 ? '#225ea8' :
            cases > 200 ? '#1d91c0' :
                cases > 100 ? '#41b6c4' :
                    cases > 50 ? '#7fcdbb' :
                        cases > 20 ? '#c7e9b4' :
                            cases > 10 ? '#edf8b1' :
                                '#ffffd9';
}

//Legend for self-isolated cases
const selfIso_legend = L.control({position: 'bottomright'});

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
const highRisk_legend = L.control({position: 'bottomright'});

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
const confirmedCircles = L.layerGroup();

// find the max city case number in canada
let max_cases = 0;
for (let i = 0; i < confirmed_data.length; i++) {
    if (confirmed_data[i]['coord'][0] !== "N/A") {
        if (confirmed_data[i]['cases'] > max_cases) {
            max_cases = confirmed_data[i]['cases'];
        }
    }
}

// draw circles
const max_rad = 80;
for (let i = 0; i < confirmed_data.length; i++) {
    //Add the marker
    if (confirmed_data[i]['coord'][0] !== "N/A") {
        let rad;
        if (confirmed_data[i]['cases'] < 10) {
            rad = 5;
        } else {
            rad = 5 + confirmed_data[i]['cases'] / max_cases * max_rad;
        }

        const circle = new L.circleMarker(confirmed_data[i]['coord'], {
            weight: 0,
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: rad
        });

        //initialize infowindow text
        circle.bindPopup("<h3>" + confirmed_data[i].name + "</h3><p>" + confirmed_data[i]['cases'] + " confirmed cases in this area</p>");

        //Add circle to circle array
        circle.addTo(confirmedCircles);
    }
}

// Enable marker layer
map.addLayer(confirmedCircles);

