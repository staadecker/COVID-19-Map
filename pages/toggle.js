function toggle_clicked(radio) {
    if (radio.value == "in_self_isolation") {
        map.removeLayer(confirmedCircles);
        selfIsolatedPolygons.addTo(map);
        map.removeLayer(highRiskPolygons);
    } else if (radio.value == "high_risk") {
        map.removeLayer(confirmedCircles);
        map.removeLayer(selfIsolatedPolygons);
        highRiskPolygons.addTo(map);
    } else {
        confirmedCircles.addTo(map);
        map.removeLayer(selfIsolatedPolygons);
        map.removeLayer(highRiskPolygons);

    }
    abc.bringToFront();
}
