let text;
const FRENCH = "fr";
const ENGLISH = "en";
let lang;

function read_lang_param() {
    // To set text to french use ?lang=fr in URL
    lang = new URLSearchParams(window.location.search).get('lang');

    if (!lang) lang = ENGLISH;

    switch (lang) {
        case FRENCH:
            text = text_fr;
            break;
        case ENGLISH:
            text = text_en;
            break;
        default:
            console.log("Unknown language passed in")
    }

    if (Object.keys(text_en).length !== Object.keys(text_fr).length) {
        console.log("Warning: Languages have different number of elements. Fix text.js.")
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

read_lang_param();
update_text();
