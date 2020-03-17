/* Data points defined as an array of LatLng objects */
var heatmapData = [
    new google.maps.LatLng(37.782, -122.447),
    new google.maps.LatLng(37.782, -122.445),
    new google.maps.LatLng(37.782, -122.443),
    new google.maps.LatLng(37.782, -122.441),
    new google.maps.LatLng(37.782, -122.439),
    new google.maps.LatLng(37.782, -122.437),
    new google.maps.LatLng(37.782, -122.435),
    new google.maps.LatLng(37.785, -122.447),
    new google.maps.LatLng(37.785, -122.445),
    new google.maps.LatLng(37.785, -122.443),
    new google.maps.LatLng(37.785, -122.441),
    new google.maps.LatLng(37.785, -122.439),
    new google.maps.LatLng(37.785, -122.437),
    new google.maps.LatLng(37.785, -122.435)
];

var sanFrancisco = new google.maps.LatLng(37.774546, -122.433523);

map = new google.maps.Map(document.getElementById('map'), {
    center: sanFrancisco,
    zoom: 13,
    mapTypeId: 'satellite'
});

var heatmap = new google.maps.visualization.HeatmapLayer({
    data: heatmapData,
    dissipating: false,
    radius: 1
});
heatmap.setMap(map);

var script = document.createElement('script');
script.src = 'self-report.js';


/*data format reference: 
codePolyArray = [
    [
        {lat: 37.782, lng: -122.447},
        {lat: 34.782, lng: -100.445},
        {lat: 45.321, lng: -64.757}], 
    [
        {lat: 25.774, lng: -80.190},
        {lat: 18.466, lng: -66.118},
        {lat: 32.321, lng: -64.757}],
]
confirmedArray = [
{items: 1, coordinates: [50.782, -122.447]}
]*/

//Array of Google Map API polygons and markers
var polygons = [];
var markers = [];


//read postalcodePolygonArray and create polygons with pop up
window.eqfeed_callback = function (results) {

	//Loop on the postalcodePolygonArray
	for (var i = 0; i < codePolyArray.length; i++) {

    	//Add the polygon
		var p = new google.maps.Polygon({
			paths: codePolyArray[i],
			strokeWeight: 0,
			fillColor: '#FF0000',
			fillOpacity: 0.6,
			indexID: i
		});
		p.setMap(map);

		//Add polygon to polygon array
		polygons[i] = p;
		
		//initialize infowindow text
		p.info = new google.maps.InfoWindow({
				//maxWidth : 250,
				content : "No Cases Collected"
			});

		//Runs when user clicks on polygon
		p.addListener('click', popup);
    }
	
	//Loop on the postalcodePolygonArray
	for (var i = 0; i < confirmedArray.length; i++) {
        confirmedCase = confirmedArray[i]
        //Add the marker
        var latLng = new google.maps.LatLng(confirmedCase.coordinates[0], confirmedCase.coordinates[1]);
        var marker = new google.maps.Marker({
                position : latLng,
                map : map,
                //icon : icon_path
            });
		marker.setMap(map);

		//Add polygon to polygon array
		markers[i] = marker;
		
		//initialize infowindow text
		marker.info = new google.maps.InfoWindow({
				//maxWidth : 250,
				content : "1 case confirmed"
			});

		//Runs when user clicks on polygon
		marker.addListener('click', popup);
    }
    
}


function popup(event) {
    //Close all info windows
    for (var i = 0; i < polygons.length; i++) {
      polygons[i].info.close();
    }
    for (var i = 0; i < markers.length; i++) {
        markers[i].info.close();
      }
      
    //Open polygon infowindow
    this.info.setPosition(event.latLng)
    this.info.open(map, this);
    }





