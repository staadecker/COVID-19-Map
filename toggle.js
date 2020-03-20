function toggle_clicked(radio) {
    switch (radio.value) {
        case "in_self_isolation":
            map.removeLayer(confirmedCircles);
            selfIsolatedPolygons.addTo(map);
            map.removeLayer(highRiskPolygons);
            break;
        case "high_risk":
            map.removeLayer(confirmedCircles);
            map.removeLayer(selfIsolatedPolygons);
            highRiskPolygons.addTo(map);
            break;
        default:
            confirmedCircles.addTo(map);
            map.removeLayer(selfIsolatedPolygons);
            map.removeLayer(highRiskPolygons);
            break;
    }
}
