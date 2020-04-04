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

read_lang_param();
update_text();