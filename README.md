# COVID-19 Map

Web-based map showing confirmed cases and self-isolation and at-risk counts in Canada.

## Details

- The basics of a webpage (markup, styles, scripts) can be found in the root directory.
- Local data is in the `/data` directory.
- Randomized generators for local data are in `/data_generator_scripts`.

## Prerequisites

- A web browser.
  - [Chrome](https://www.google.com/chrome) or [Chromium](https://www.chromium.org)-based browsers are recommended.
- [Python 3.5+](https://www.python.org/)

- For the confirmed generator script: `pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib`

## Usage

- To run a data generator script, `cd` into the folder containing the `python` script you want to run, and copy the resulting `*SAMPLE.js` file into `/data`.
- Open `index.html` in your browser.

## Credits

Thank you to Statistics Canada for the following data.

_Census Forward Sortation Area Boundary File, 2016 Census._ Statistics Canada Catalogue no. 92-179-X.
