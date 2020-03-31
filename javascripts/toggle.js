function toggle_clicked(radioValue) {
    switch (radioValue) {
        case "confirmed":
            map.removeLayer(selfIsolatedPolygons);
            map.removeLayer(highRiskPolygons);
            map.removeControl(selfIso_legend);
            map.removeControl(highRisk_legend);

            confirmedCircles.addTo(map);

            document.getElementById("update_time").innerHTML = confirmed_data['last_updated'];
            break;

        case "vulnerable":
            map.removeLayer(confirmedCircles);
            map.removeLayer(selfIsolatedPolygons);
            if (map.legend !== null) map.removeControl(selfIso_legend);

            highRiskPolygons.addTo(map);
            highRisk_legend.addTo(map);

            document.getElementById("update_time").innerHTML = "Total Responses: " + form_data_obj['total_responses'] + " | Last update: " + new Date(1000 * form_data_obj["time"]);
            break;

        case "potential":
            map.removeLayer(confirmedCircles);
            map.removeLayer(highRiskPolygons);
            if (map.legend !== null) map.removeControl(highRisk_legend);
            
            selfIsolatedPolygons.addTo(map);
            selfIso_legend.addTo(map);

            document.getElementById("update_time").innerHTML = "Total Responses: " + form_data_obj['total_responses'] + " | Last update: " + new Date(1000 * form_data_obj["time"]);
            break;
        default:
            console.log("Toggle called with the wrong option. " + radioValue)
    }

    if (current_location) current_location.bringToFront();
}
