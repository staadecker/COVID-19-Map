// 1. Get language from parameter in URL
const param = new URLSearchParams(window.location.search);
const lang = param.get('lang');

switch (lang) {
    case "fr":
        text = text_fr;
        break;
    default:
        text = text_en;
}

// 2. Load language file
const pageElements = document.getElementsByClassName("lang");

// 3. For each key (ex. "about-us-paragraph-3")
    // 4. Get id by prefixing lan- (ex. "lan-about-us-paragraph")
    // 5. Get element with that id
    // 6. Set element text to the value in the dictionary
for (let i = 0; i < pageElements.length; i++) {
    if (pageElements[i].id in text) {
        pageElements[i].innerHTML = text[pageElements[i].id];
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

