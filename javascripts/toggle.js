let current_tab = null;

function toggle_clicked(radioValue){
    if (current_tab) tabs[current_tab].remove_from_map(map);
    tabs[radioValue].add_to_map(map);
    current_tab = radioValue;
}