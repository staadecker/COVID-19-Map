let text;

function read_lang_param() {
    // To set text to french use ?lang=fr in URL
    const param = new URLSearchParams(window.location.search);

    if (param.get('lang') === "fr") {
        text = text_fr;
    } else {
        text = text_en;
    }
}

function update_text() {
    // Loop through all page elements
    const pageElements = document.getElementsByClassName("lang");

    for (let pageElement of pageElements) {
        if (pageElement.id in text) {
            pageElement.innerHTML = text[pageElement.id];
        }
    }

}
let potential_popup = text['pot_case_popup'];
let potential_popup_1 = text['pot_case_popup_1'];
let vul_popup = text['vul_case_popup'];
let vul_popup_1 = text['vul_case_popup_1'];
let cul_popup = text['confirm_pop'];
let searchtext = text['searchbar'];
let noEntries_pop = text['msg_noentries'];
let notSup_pop = text['notSupported_pop'];
let both_popup = text['pot_vul_popup'];
let both_popup_1 = text['pot_vul_popup_1'];


read_lang_param();
update_text();