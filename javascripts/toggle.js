function toggle_clicked(radioValue) {
    switch (radioValue) {
        case "confirmed":

            highRiskMap.toggleOff(map);
            selfIsolatedMap.toggleOff(map);

            document.getElementById("update_time").innerHTML = confirmedMap.toggleOn(map);
            break;

        case "vulnerable":

            confirmedMap.toggleOff(map);
            selfIsolatedMap.toggleOff(map);

            document.getElementById("update_time").innerHTML = highRiskMap.toggleOn(map);
            break;

        case "potential":
            highRiskMap.toggleOff(map);
            confirmedMap.toggleOff(map);
            
            document.getElementById("update_time").innerHTML = selfIsolatedMap.toggleOn(map);
            break;
        default:
            console.log("Toggle called with the wrong option. " + radioValue)
    }

    if (current_location) current_location.bringToFront();
}
