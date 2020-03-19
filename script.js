// Create map
map = new google.maps.Map(document.getElementById('map'), {
    center: new google.maps.LatLng(53.9902, -97.8155),
    zoom: 4,
    streetViewControl: false,
    mapTypeControl: false
});

document.write(data_last_updated);

// Try HTML5 geolocation. // Else Browser doesn't support Geolocation or permission not given.
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
            const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            const marker = new google.maps.Marker({
                position: pos,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    strokeWeight: 3,
                    fillColor: 'royalblue',
                    strokeColor: 'white',
                    fillOpacity: 1,
                    strokeOpacity: 0.5
                },
            });

            map.setCenter(pos);
            map.setZoom(8);
            marker.setMap(map);
        },
    );
}

// Load data files
postal_code_data = JSON.parse(data_postal_code_boundaries);
in_self_isolation_data = JSON.parse(data_in_self_isolation_sample);
confirmed_data = JSON.parse(data_confirmed);

// Create layers

//Array of Google Map API polygons and markers
let polygons = [];
let markers = [];

let polygonCount = 0;
for (let fsa in postal_code_data) {
    if (postal_code_data.hasOwnProperty(fsa)) {
        const num_in_self_isolation = in_self_isolation_data['fsa'][fsa];

        for (let i = 0; i < postal_code_data[fsa].length; i++) {


            //Add the polygon
            const p = new google.maps.Polygon({
                paths: postal_code_data[fsa][i]['coord'],
                strokeWeight: 0.5,
                fillColor: '#FF0000',
                fillOpacity: num_in_self_isolation / in_self_isolation_data['max'] * 0.5,
                indexID: polygonCount
            });


            //Initialize infowindow text
            p.info = new google.maps.InfoWindow({
                /*maxWidth : 250,*/
                content: "<h3>" + fsa + "</h3><p>" + num_in_self_isolation + " people in self-isolation</p>"
            });

            //Add polygon to polygon array
            polygons[polygonCount] = p;

            //Runs when user clicks on polygon
            p.addListener('click', item_pressed);


            polygonCount++;
        }
    }
}

//Loop on the confirmed cases
for (let i = 0; i < confirmed_data.length; i++) {
    //Add the marker
    const position = new google.maps.LatLng(confirmed_data[i].coord[0], confirmed_data[i].coord[1]);
    const marker = new google.maps.Marker({
        position: position,
        icon: "res/marker.svg"
    });

    //initialize infowindow text
    marker.info = new google.maps.InfoWindow({
        //maxWidth : 250,
        content: "<h3>" + confirmed_data[i].name + "</h3><p>" + confirmed_data[i].cases + " confirmed cases in this area</p>"
    });

    //Add polygon to polygon array
    markers[i] = marker;

    //Runs when user clicks on polygon
    marker.addListener('click', item_pressed);
}

// Enable marker layer
setMapOnAll(map, markers);

//Functions


function item_pressed(event) {
    //Close all info windows
    for (let i = 0; i < polygons.length; i++) {
        polygons[i].info.close();
    }
    for (let i = 0; i < markers.length; i++) {
        markers[i].info.close();
    }

    //Open polygon infowindow
    this.info.setPosition(event.latLng);
    this.info.open(map, this);
}

function toggle_clicked(radio) {
    if (radio.value === "in_self_isolation") {
        setMapOnAll(null, markers);
        setMapOnAll(map, polygons);
    } else {
        setMapOnAll(map, markers);
        setMapOnAll(null, polygons);
    }
}


// Set every item in group to the map specified by map. map can be null
function setMapOnAll(map, groups) {
    for (let i = 0; i < groups.length; i++) {
        groups[i].setMap(map);
    }
}
