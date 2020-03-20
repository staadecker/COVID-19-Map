function toggle_clicked(radio) {
    switch (radio.value) {
        case "in_self_isolation":
            setMapOnAll(null, confirmedMarkers);
            setMapOnAll(map, selfIsolatedPolygons);
            setMapOnAll(null, highRiskPolygons);
            break;
        case "high_risk":
            setMapOnAll(null, confirmedMarkers);
            setMapOnAll(null, selfIsolatedPolygons);
            setMapOnAll(map, highRiskPolygons);
            break;
        default:
            setMapOnAll(map, confirmedMarkers);
            setMapOnAll(null, selfIsolatedPolygons);
            setMapOnAll(null, highRiskPolygons);
            break;
    }
}
