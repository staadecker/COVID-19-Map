class ColourScheme {
    constructor(colours, thresholds) {
        this.colours = colours;
        this.thresholds = thresholds;

        if (thresholds.length !== colours.length - 1)  // Minus one since one more color then threshold
            console.log("WARNING: list lengths don't match in ColorScheme.");
    }

    // assigns color based on thresholds
    getColour(case_num) {
        for (let i = 0; i < this.thresholds.length; i++)
            if (case_num < this.thresholds[i]) return this.colours[i];

        return this.colours[this.colours.length - 1];
    }
}

const COLOURS = ['#ffffb2', '#fecc5c', '#fd8d3c', '#f03b20', '#bd0026'];
const POLYGON_OPACITY = 0.4;
const NOT_ENOUGH_GRAY = '#909090';

const POT_COLOUR_SCHEME = new ColourScheme(COLOURS, [0.02, 0.05, 0.1, 0.25]);
const VULN_COLOUR_SCHEME = new ColourScheme(COLOURS, [0.15, 0.25, 0.35, 0.50]);
const BOTH_COLOUR_SCHEME = new ColourScheme(COLOURS, [0.01, 0.02, 0.05, 0.1]);
const CONFIRMED_COLOUR_SCHEME = new ColourScheme(COLOURS, [5, 25, 100, 250]);