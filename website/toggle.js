function toggle_clicked(radio) {
    switch (radio.value) {
        case "in_self_isolation":
            map.removeLayer(confirmedCircles);
            selfIsolatedPolygons.addTo(map);
            map.removeLayer(highRiskPolygons);
            selfIso_legend.addTo(map);
            if (!(map.legend === null)) {
                map.removeControl(highRisk_legend);
            }
            document.getElementById("update_time").innerHTML = "Last update: " + form_data["time"];
            break;
        case "high_risk":
            map.removeLayer(confirmedCircles);
            map.removeLayer(selfIsolatedPolygons);
            highRiskPolygons.addTo(map);
            highRisk_legend.addTo(map);
            if (!(map.legend === null)) {
                map.removeControl(selfIso_legend);
            }
            document.getElementById("update_time").innerHTML = "Last update: " + form_data["time"];

            break;
        default:
            confirmedCircles.addTo(map);
            map.removeLayer(selfIsolatedPolygons);
            map.removeLayer(highRiskPolygons);
            document.getElementById("update_time").innerHTML = data_last_updated;

    }

    current_location.bringToFront();
}
