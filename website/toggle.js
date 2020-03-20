function toggle_clicked(radio) {
    switch (radio.value) {
        case "in_self_isolation":
            map.removeLayer(confirmedCircles);
            selfIsolatedPolygons.addTo(map);
            map.removeLayer(highRiskPolygons);
            document.getElementById("update_time").innerHTML = "Last update: " + in_self_isolation_data["time"];
            break;
        case "high_risk":
            map.removeLayer(confirmedCircles);
            map.removeLayer(selfIsolatedPolygons);
            highRiskPolygons.addTo(map);
            document.getElementById("update_time").innerHTML = "Last update: " + high_risk_data["time"];

            break;
        default:
            confirmedCircles.addTo(map);
            map.removeLayer(selfIsolatedPolygons);
            map.removeLayer(highRiskPolygons);
            document.getElementById("update_time").innerHTML = data_last_updated;

    }

    current_location.bringToFront();
}
