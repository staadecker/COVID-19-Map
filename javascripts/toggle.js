function toggle_clicked(radioValue) {
    if (mapConfigs[radioValue] === null) {
        console.log("Toggle called with the wrong option. " + radioValue)
        return
    }

    for (var key in mapConfigs) {
        if (key !== radioValue){
            mapConfigs[key].toggleOff(map);
            continue
        }
        document.getElementById("update_time").innerHTML = mapConfigs[key].toggleOn(map);
    }

    if (current_location) current_location.bringToFront();
}
