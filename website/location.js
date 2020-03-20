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