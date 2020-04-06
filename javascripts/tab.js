let current_tab = null;

class Tab {
    constructor(legend, search_control, layer_style, popup_type) {
        this.map_layer = null;
        this.legend = legend;
        this.search_control = search_control;
        this.layer_style = layer_style;
        this.popup_type = popup_type;
        this.time_message = null;
    }

    remove_from_map(map) {
        if (this.map_layer) map.removeLayer(this.map_layer);

        if (this.search_control) {
            this.search_control.collapse();
            this.search_control.cancel();
            map.removeControl(this.search_control)
        }

        if (this.legend) map.removeControl(this.legend);
        document.getElementById("update_time").innerHTML = "";
    }

    add_to_map(map) {
        if (this.time_message) document.getElementById("update_time").innerHTML = this.time_message;

        if (this.map_layer) {
            this.map_layer.addTo(map);
            if (current_location) current_location.bringToFront();

            if (this.layer_style) {
                this.map_layer.setStyle(this.layer_style);
            }
            if (this.popup_type) {
                adjustPopups(this);
            }
        }

        if (this.legend) map.addControl(this.legend);
        if (this.search_control) map.addControl(this.search_control);

        current_tab = this;
    }

    switch_to_tab(map) {
        if (this !== current_tab) {
            if (current_tab) current_tab.remove_from_map(map);
            this.add_to_map(map);
        }
    }
}