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

console.log(text);

// 2. Load language file

// 3. For each key (ex. "about-us-paragraph-3")
    // 4. Get id by prefixing lan- (ex. "lan-about-us-paragraph")
    // 5. Get element with that id
    // 6. Set element text to the value in the dictionary
