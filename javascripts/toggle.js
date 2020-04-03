function toggle_clicked(radioValue) {
    switch (radioValue) {
        case "confirmed":
            confirmedCircles.addTo(map);
            map.removeLayer(polygons);
            document.getElementById("update_time").innerHTML = confirmed_data['last_updated'];
            map.removeControl(current_legend);
            searchControl_polygons.collapse();
            searchControl_polygons.cancel();
            map.removeControl(searchControl_polygons);
            break;

        case "vulnerable":
            map.removeLayer(confirmedCircles);
            polygons.addTo(map);
            polygons.setStyle(highRisk_style);
            adjustPopups("highRisk");
            if (!(map.legend === null)) map.removeControl(current_legend);

            current_legend = highRisk_legend.addTo(map);
            map.addControl(current_legend);

            document.getElementById("update_time").innerHTML = "Total Responses: " + form_data_obj['total_responses'] + " | Last update: " + new Date(1000 * form_data_obj["time"]);
            break;

        case "potential":
            map.removeLayer(confirmedCircles);
            polygons.addTo(map);
            polygons.setStyle(selfIso_style);
            adjustPopups("selfIso");

            if (!(map.legend === null)) map.removeControl(current_legend);

            current_legend = selfIso_legend.addTo(map);
            map.addControl(current_legend);
            map.addControl(searchControl_polygons);
            document.getElementById("update_time").innerHTML = "Total Responses: " + form_data_obj['total_responses'] + " | Last update: " + new Date(1000 * form_data_obj["time"]);
            break;
        case "pot_vul":
            map.removeLayer(confirmedCircles);
            polygons.addTo(map);
            polygons.setStyle(potVul_style);
            adjustPopups("both");

            if (!(map.legend === null)) map.removeControl(current_legend);

            current_legend = potVul_legend.addTo(map);
            map.addControl(current_legend);
            map.addControl(searchControl_polygons);
            document.getElementById("update_time").innerHTML = "Total Responses: " + form_data_obj['total_responses'] + " | Last update: " + new Date(1000 * form_data_obj["time"]);
            break;
        default:
            console.log("Toggle called with the wrong option. " + radioValue)
    }

    if (current_location) current_location.bringToFront();
}
