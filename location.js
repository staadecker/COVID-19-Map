// Try HTML5 geolocation. // Else Browser doesn't support Geolocation or permission not given.
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
            const pos = L.LatLng(position.coords.latitude, position.coords.longitude);
            
            const marker = new L.marker(pos).addTo(map);

            map.setCenter(pos);
            map.setZoom(8);
            marker.setMap(map);
        },
    );
}