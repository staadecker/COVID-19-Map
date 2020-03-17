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
script.src = 'data.js';

//read postalcodePolygonArray and create polygons with pop up
window.eqfeed_callback = function (results) {

	//Array of Google Map API polygons
	var polygons = [];
	
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
				maxWidth : 250,
				content : "No Cases Collected"
			});

		//Runs when user clicks on marker
		google.maps.event.addListener(p, 'click', function () {
			//Close all info windows
			for (var i = 0; i < polygons.length; i++) {
				polygons[i].info.close();
			}
			//Center and zoom on polygon
			map.panTo(this.position);
			map.setZoom(15);

			//Open polygon infowindow
			this.info.open(map, this);
		});
	}
}
