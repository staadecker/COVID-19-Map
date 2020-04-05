let text;

function read_lang_param() {
    // To set text to french use ?lang=fr in URL
    const param = new URLSearchParams(window.location.search);

    if (param.get('lang') === "fr") {
        text = text_fr;
    } else {
        text = text_en;
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
