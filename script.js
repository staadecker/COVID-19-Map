/* Data points defined as an array of LatLng objects */


map = new google.maps.Map(document.getElementById('map'), {
    center: new google.maps.LatLng(43.6532, -79.3832), // Toronto
    zoom: 4
});

polygons_data = [
    [
        {lat: 37.782, lng: -122.447},
        {lat: 34.782, lng: -100.445},
        {lat: 45.321, lng: -64.757}],
    [
        {lat: 25.774, lng: -80.190},
        {lat: 18.466, lng: -66.118},
        {lat: 32.321, lng: -64.757}],
];

confirmed_data = [
    {items: 1, coordinates: [50.782, -122.447]}
];


//Array of Google Map API polygons and markers
let polygons = [];
let markers = [];

//Loop on the postalcodePolygonArray
for (let i = 0; i < polygons_data.length; i++) {

    //Add the polygon
    const p = new google.maps.Polygon({
        paths: polygons_data[i],
        strokeWeight: 0,
        fillColor: '#FF0000',
        fillOpacity: 0.6,
        indexID: i
    });
    p.setMap(map);

    //initialize infowindow text
    p.info = new google.maps.InfoWindow({
        /*maxWidth : 250,*/ content: "No Cases Collected"
    });

    //Add polygon to polygon array
    polygons[i] = p;

    //Runs when user clicks on polygon
    p.addListener('click', item_pressed);
}

//Loop on the confirmed cases
for (let i = 0; i < confirmed_data.length; i++) {
    //Add the marker
    const position = new google.maps.LatLng(confirmed_data[i].coordinates[0], confirmed_data[i].coordinates[1]);
    const marker = new google.maps.Marker({
        position: position,
        map: map
    });

    //initialize infowindow text
    marker.info = new google.maps.InfoWindow({
        //maxWidth : 250,
        content: "1 case confirmed"
    });

    //Add polygon to polygon array
    markers[i] = marker;

    //Runs when user clicks on polygon
    marker.addListener('click', item_pressed);
}


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


