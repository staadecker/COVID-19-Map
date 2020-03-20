// Try HTML5 geolocation. // Else Browser doesn't support Geolocation or permission not given.
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      latit = position.coords.latitude;
      longit = position.coords.longitude;
      // this is just a marker placed in that position
      var abc = L.marker([position.coords.latitude, position.coords.longitude]).addTo(map);
      abc.bindPopup("<h3>Current Location</h3>");
      // move the map to have the location in its center
      map.setView(new L.LatLng(latit, longit), 10);
    });
}