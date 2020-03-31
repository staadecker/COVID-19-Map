function toggle_clicked(radioValue) {
    switch (radioValue) {
        case "confirmed":
            confirmedCircles.addTo(map);
            map.removeLayer(polygons);
            document.getElementById("update_time").innerHTML = confirmed_data['last_updated'];
            map.removeControl(selfIso_legend);
            map.removeControl(highRisk_legend);
            break;

        case "vulnerable":
            map.removeLayer(confirmedCircles);
            polygons.addTo(map);
            polygons.setStyle(highRisk_style);
            highRisk_legend.addTo(map);
            if (!(map.legend === null)) map.removeControl(selfIso_legend);

            document.getElementById("update_time").innerHTML = "Total Responses: " + form_data_obj['total_responses'] + " | Last update: " + new Date(1000 * form_data_obj["time"]);
            break;

        case "potential":
            map.removeLayer(confirmedCircles);
            polygons.addTo(map);
            polygons.setStyle(selfIso_style);
            selfIso_legend.addTo(map);
            if (!(map.legend === null)) map.removeControl(highRisk_legend);

            document.getElementById("update_time").innerHTML = "Total Responses: " + form_data_obj['total_responses'] + " | Last update: " + new Date(1000 * form_data_obj["time"]);
            break;

        default:
            console.log("Toggle called with the wrong option. " + radioValue)
    }

    if (current_location) current_location.bringToFront();
}
