function toggle_clicked(radioValue) {
    switch (radioValue) {
        case "confirmed":
            confirmedCircles.addTo(map);
            map.removeLayer(selfIsolatedPolygons);
            map.removeLayer(highRiskPolygons);
            document.getElementById("update_time").innerHTML = confirmed_data['last_updated'];
            map.removeControl(selfIso_legend);
            map.removeControl(highRisk_legend);
            break;

        case "vulnerable":
            map.removeLayer(confirmedCircles);
            map.removeLayer(selfIsolatedPolygons);
            highRiskPolygons.addTo(map);
            highRisk_legend.addTo(map);
            if (!(map.legend === null)) map.removeControl(selfIso_legend);
            
            document.getElementById("update_time").innerHTML = "Total Responses: " + form_data_obj['total_responses'] + " | Last update: " + new Date(1000 * form_data_obj["time"]);
            break;

        case "potential":
            map.removeLayer(confirmedCircles);
            selfIsolatedPolygons.addTo(map);
            map.removeLayer(highRiskPolygons);
            selfIso_legend.addTo(map);
            if (!(map.legend === null)) map.removeControl(highRisk_legend);

            document.getElementById("update_time").innerHTML = "Total Responses: " + form_data_obj['total_responses'] + " | Last update: " + new Date(1000 * form_data_obj["time"]);
            break;

        default:
            console.log("Toggle called with the wrong option. " + radioValue)
    }

    if (current_location) current_location.bringToFront();
}
