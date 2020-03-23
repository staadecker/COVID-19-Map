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
{
            "time" : "Sun Jun 20 23:21:05 1993",
            "total_responses" : "6969", # total number of reports recieved
            "max" : 9992,
            "fsa" : {
                "B1A" : {"number_reports": 4938, "pot": 23, "risk": 18},
                .
                .
                .
    }
} 
```
`confirmed.json`

```
{
    "last_updated" : "Date accessed at: 23/03/2020...",
    "max_cases" : 230,
    "confirmed_cases": [
        {
            "name" : "Algoma, Ontario",
            "cases" : 1,
            "coord" : [44.289, -79.8536]
        },
        {
            "name" : "Bas-Saint-Laurent, Quebec",
            "cases" : 2,
            "coord" : [48.30, 23.4]
        }
    ]
}
```


### Setting up Firebase Storage for the first time

This only needs to be done once per project, so don't worry about it.

To allow the frontend of the map to read from the cloud storage buckets (storing the data), you will need to set the origin policy to allow reading of the cloud storage buckets. Add the following to a file called cors.json:
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


## Deploying on Cloud Build

Everything should work more or less out of the box, apart from the fact that you have to set the `_BRANCH` envoronment variable to `prod` for prouduction or `dev` for development.


## Deploying the cloud functions

You will need to set the appropriate environment variables for each.

For form_data_generator, these are
* GCS_BUCKET, should point to that which to upload the data
* UPLOAD_FILE, the name of the file to upload the confirmed cases data to
* DS_NAMEPSACE, datastore namespaace to get the data from
* DS_KIND, the datastore kind to load data from

For `confirmed_cases`, they are:
* SPREADSHEET_ID, should (at the moment) be 
* GCS_BUCKET, should point to that which to upload the data
* UPLOAD_FILE, the name of the file to upload the confirmed cases data to
* SHEETS_API_KEY, API key for google sheets.

## Credits

Thank you to Statistics Canada for the following data.

Census Forward Sortation Area Boundary File, 2016 Census._ Statistics Canada Catalogue no. 92-179-X.
