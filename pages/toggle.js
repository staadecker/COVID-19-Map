function toggle_clicked(radio) {
    switch (radio.value) {
        case "in_self_isolation":
            setMapOnAll(null, confirmedMarkers);
            setMapOnAll(map, selfIsolatedPolygons);
            setMapOnAll(null, highRiskPolygons);
            document.getElementById("update_time").innerHTML = "Last update: " + in_self_isolation_data["time"];
            break;
        case "high_risk":
            setMapOnAll(null, confirmedMarkers);
            setMapOnAll(null, selfIsolatedPolygons);
            setMapOnAll(map, highRiskPolygons);
            document.getElementById("update_time").innerHTML = "Last update: " + high_risk_data["time"];
            break;
        default:
            setMapOnAll(map, confirmedMarkers);
            setMapOnAll(null, selfIsolatedPolygons);
            setMapOnAll(null, highRiskPolygons);
            document.getElementById("update_time").innerHTML = data_last_updated;
            
            break;
    }
}
