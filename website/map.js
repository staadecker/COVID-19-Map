// Create map.
const map = new L.map('map').setView([53.9902, -97.8155], 4);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

document.getElementById("update_time").innerHTML = data_last_updated;
document.getElementById("data_source").innerHTML += "("+data_last_updated.toString()+")"

// Load data files
postal_code_data = JSON.parse(data_postal_code_boundaries);
in_self_isolation_data = JSON.parse(data_in_self_isolation_sample);
high_risk_data = JSON.parse(data_high_risk_sample);
confirmed_data = JSON.parse(data_confirmed);

// Array of Google Map API polygons for self-isolated and high-risk addresse
const selfIsolatedPolygons = L.layerGroup();
const highRiskPolygons = L.layerGroup();

for (let fsa in postal_code_data) {
    if (!postal_code_data.hasOwnProperty(fsa)) continue;
    const num_severe = in_self_isolation_data['fsa'][fsa]['severe'];
    const num_mild = in_self_isolation_data['fsa'][fsa]['mild'];
    const num_high_risk = high_risk_data['fsa'][fsa];

    colour_selfIso = getColor_selfIso(num_severe + num_mild);
    colour_highRisk = getColor_highRisk(num_high_risk);

    var opacity_selfIso = 0.4;
    var opacity_highRisk = 0.4;

    if (num_severe + num_mild == 0) {
        opacity_selfIso = 0;
    }

    if (num_high_risk == 0) {
        opacity_highRisk = 0
    }

    for (let i = 0; i < postal_code_data[fsa].length; i++) {

        // Add the polygons.
        const selfIsolatedPolygon = new L.Polygon(postal_code_data[fsa][i]['coord'], {
            weight: 0.9,
            color: 'white',
            dashArray: '3',
            fillColor: colour_selfIso,
            fillOpacity: opacity_selfIso,
        });
        const highRiskPolygon = new L.Polygon(postal_code_data[fsa][i]['coord'], {
            weight: 0.9,
            color: 'white',
            dashArray: '3',
            fillColor: colour_highRisk,
            fillOpacity: opacity_highRisk,
        });


        //Initialize infowindow text
        selfIsolatedPolygon.bindPopup("<h3>" + fsa + "</h3><p>"
            //+ num_severe + " with severe symptoms / " + num_mild + " with mild symptoms</p>"
            + (num_severe + num_mild) + " potential cases</p>");

        highRiskPolygon.bindPopup("<h3>" + fsa + "</h3><p>" + num_high_risk + " people vulnerable</p>");

        // Add polygons to polygon arrays and add click listeners.
        selfIsolatedPolygon.addTo(selfIsolatedPolygons);
        highRiskPolygon.addTo(highRiskPolygons);
    }
}

function getColor_selfIso(cases) {
    return cases > 1000 ? '#800026' :
        cases > 500  ? '#BD0026' :
        cases > 200  ? '#E31A1C' :
        cases > 100  ? '#FC4E2A' :
        cases > 50   ? '#FD8D3C' :
        cases > 20   ? '#FEB24C' :
        cases > 10   ? '#FED976' :
                       '#FFEDA0';
}

function getColor_highRisk(cases) {
    return cases > 1000 ? '#0c2c84' :
        cases > 500  ? '#225ea8' :
        cases > 200  ? '#1d91c0' :
        cases > 100  ? '#41b6c4' :
        cases > 50   ? '#7fcdbb' :
        cases > 20   ? '#c7e9b4' :
        cases > 10   ? '#edf8b1' :
                       '#ffffd9';
}


// Array of Leaflet API markers for confirmed cases.
const confirmedCircles = L.layerGroup();

for (let i = 0; i < confirmed_data.length; i++) {
    //Add the marker
    if (confirmed_data[i].coord[0] !== "N/A") {
        let rad;
        if (confirmed_data[i].cases < 10) {
            rad = 5;
        } else {
            rad = 10 + confirmed_data[i].cases / 5;
        }

        const circle = new L.circleMarker(confirmed_data[i].coord, {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: rad
        });

        //initialize infowindow text
        circle.bindPopup("<h3>" + confirmed_data[i].name + "</h3><p>" + confirmed_data[i].cases + " confirmed cases in this area</p>");

        //Add circle to circle array
        circle.addTo(confirmedCircles);
    }
}

// Enable marker layer
map.addLayer(confirmedCircles);

