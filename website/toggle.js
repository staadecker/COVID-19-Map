function toggle_clicked(radio) {
    let time;
    switch (radio.value) {
        case "in_self_isolation":
            map.removeLayer(confirmedCircles);
            selfIsolatedPolygons.addTo(map);
            map.removeLayer(highRiskPolygons);
            selfIso_legend.addTo(map);
            if (!(map.legend === null)) {
                map.removeControl(highRisk_legend);
            }
            time = Date(form_data_obj["time"]);
            document.getElementById("update_time").innerHTML = time;
            break;
        case "high_risk":
            map.removeLayer(confirmedCircles);
            map.removeLayer(selfIsolatedPolygons);
            highRiskPolygons.addTo(map);
            highRisk_legend.addTo(map);
            if (!(map.legend === null)) {
                map.removeControl(selfIso_legend);
            }
            time = Date(form_data_obj["time"]);
            document.getElementById("update_time").innerHTML = "Last update: " + time;

            break;
        default:
            confirmedCircles.addTo(map);
            map.removeLayer(selfIsolatedPolygons);
            map.removeLayer(highRiskPolygons);
            document.getElementById("update_time").innerHTML = confirmed_data['time'];
            map.removeControl(selfIso_legend);
            map.removeControl(highRisk_legend);
    }

    if (current_location) {
        current_location.bringToFront();
    }
}
