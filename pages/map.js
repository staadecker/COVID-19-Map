// Create map.
map = new google.maps.Map(document.getElementById('map'), {
    center: new google.maps.LatLng(53.9902, -97.8155),
    zoom: 4,
    streetViewControl: false,
    mapTypeControl: false
});

document.write(data_last_updated);

// Load data files
postal_code_data = JSON.parse(data_postal_code_boundaries);
in_self_isolation_data = JSON.parse(data_in_self_isolation_sample);
high_risk_data = JSON.parse(data_high_risk_sample);
confirmed_data = JSON.parse(data_confirmed);

// Array of Google Map API polygons for self-isolated and high-risk addresses.
let polygonCount = 0;
let selfIsolatedPolygons = [];
let highRiskPolygons = [];

for (let fsa in postal_code_data) {
    if (!postal_code_data.hasOwnProperty(fsa)) continue;
    const num_severe = in_self_isolation_data['fsa'][fsa]['severe'];
    const num_mild = in_self_isolation_data['fsa'][fsa]['mild'];
    const num_high_risk = high_risk_data['fsa'][fsa];

    for (let i = 0; i < postal_code_data[fsa].length; i++) {

        // Add the polygons.
        const selfIsolatedPolygon = new google.maps.Polygon({
            paths: postal_code_data[fsa][i]['coord'],
            strokeWeight: 0.5,
            fillColor: '#FF8800',
            fillOpacity: (2 * num_severe + num_mild) / in_self_isolation_data['max'] * 0.5,
            indexID: polygonCount
        });
        const highRiskPolygon = new google.maps.Polygon({
            paths: postal_code_data[fsa][i]['coord'],
            strokeWeight: 0.5,
            fillColor: '#FF4400',
            fillOpacity: num_high_risk / high_risk_data['max'] * 0.5,
            indexID: polygonCount
        });


        //Initialize infowindow text
        selfIsolatedPolygon.info = new google.maps.InfoWindow({
            /*maxWidth : 250,*/ content: "<h3>" + fsa + "</h3><p>"
                + num_severe + " with severe symptoms / " + num_mild + " with mild symptoms</p>"
                + (num_severe + num_mild) + " total people with symptoms</p>"
        });
        highRiskPolygon.info = new google.maps.InfoWindow({ /*maxWidth : 250,*/
            content: "<h3>" + fsa + "</h3><p>" + num_high_risk + " people at high risk</p>"
        });

        // Add polygons to polygon arrays and add click listeners.
        selfIsolatedPolygons[polygonCount] = selfIsolatedPolygon;
        highRiskPolygons[polygonCount] = highRiskPolygon;
        selfIsolatedPolygon.addListener('click', item_pressed);
        highRiskPolygon.addListener('click', item_pressed);

        polygonCount++;
    }
}


// Array of Google Map API markers for confirmed cases.
let confirmedMarkers = [];
for (let i = 0; i < confirmed_data.length; i++) {
    //Add the marker
    const position = new google.maps.LatLng(confirmed_data[i].coord[0], confirmed_data[i].coord[1]);
    const marker = new google.maps.Marker({
        position: position,
        icon: "res/marker.svg"
    });

    //initialize infowindow text
    marker.info = new google.maps.InfoWindow({ // maxWidth : 250,
        content: "<h3>" + confirmed_data[i].name + "</h3><p>" + confirmed_data[i].cases + " confirmed cases in this area</p>"
    });

    // Add polygon to polygon array and add click listener.
    confirmedMarkers[i] = marker;
    marker.addListener('click', item_pressed);
}

// Enable marker layer
setMapOnAll(map, confirmedMarkers);

function item_pressed(event) {
    // Close all info windows.
    for (let i = 0; i < polygonCount; i++) {
        selfIsolatedPolygons[i].info.close();
        highRiskPolygons[i].info.close();
    }
    for (let i = 0; i < confirmedMarkers.length; i++) {
        confirmedMarkers[i].info.close();
    }

    // Open polygon infowindow.
    this.info.setPosition(event.latLng);
    this.info.open(map, this);
}

// Set every item in group to the map specified by map. map can be null
function setMapOnAll(map, groups) {
    for (let i = 0; i < groups.length; i++) {
        groups[i].setMap(map);
    }
}