// Try HTML5 geolocation. // Else Browser doesn't support Geolocation or permission not given.
let current_location;

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
        const latit = position.coords.latitude;
        const longit = position.coords.longitude;

        // this is just a marker placed in that position
        current_location = L.circleMarker([position.coords.latitude, position.coords.longitude], {
            color: 'white',
            fillColor: 'blue',
            fillOpacity: 1,
            radius: 5,
            weight: 2
        }).addTo(map);
        current_location.bindPopup("<h3>Current Location</h3>");
        // move the map to have the location in its center
        map.setView(new L.LatLng(latit, longit), 10);
    });
}