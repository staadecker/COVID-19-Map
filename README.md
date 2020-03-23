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

- For the confirmed generator script: `pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib google-cloud-storage google-cloud-datastore`

## Usage

- To run a data generator script, `cd` into the folder containing the `python` script you want to run, and copy the resulting `*SAMPLE.js` file into `/data`.
- Open `index.html` in your browser.

## Internal

### Format for form data

**`form_data.js`**

```
form_data = {
            "time" : "Sun Jun 20 23:21:05 1993", 
            "max" : {"pot": 1020, "risk": 20},
            "fsa" : {
                "B1A" : {"pot": 23, "risk": 18},
                .
                .
                .
            };  
```
Note: Time stamp can be generated with  `time.asctime()` in Python.


### Setting up Firebase Storage

To allow the frontend of the map to read from the cloud storage buckets, you will need to set the origin policy to allow reading of the cloud storage buckets. Add the following to a file called cors.json:
```
    [
      {
    "origin": ["*"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]
```
then run 
```gsutil cors set cors.json gs://flatten-staging-271921.appspot.com```

You need to ensure that the firebase rules on the bucket are set up to allow reading of the files externally.



## Credits

Thank you to Statistics Canada for the following data.

Census Forward Sortation Area Boundary File, 2016 Census._ Statistics Canada Catalogue no. 92-179-X.
