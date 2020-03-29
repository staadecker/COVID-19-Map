# COVID-19 Map

Web-based map showing confirmed cases, potential cases and vulnerable populations in Canada based on publicly available data and data from [https://flatten.ca](flatten.ca).

## Important Details

- Scripts were moved to flatten-scripts.
- Any changes to the stagging branch are automatically pushed to https://flatten-staging-271921.web.app/. Any changes to master are automatically pushed to https://flatten.ca.
- **All contributions should be made on a new branch and a pull request to *staging* should be made.**
- **Use  the Issues tabs to keep track of bugs, improvements and more. Use the Projects tab to keep track of work!**


## Prerequisites

- A web browser.
- The firebase command line interface (CLI).
  - Available at https://firebase.google.com/docs/cli#install_the_firebase_cli.

## Setting up

1. Ask Martin to create you a flatten Google account and give you read permissions to the storage.

2. If you were already logged in run `firebase logout` then `firebase login`. Use your newly generated Google account.

3. Create two new files in the root directory called `firebase.json` and `.firebasec`. They should have the same contents as `deployment/firebase.staging.json` and `deployment/.firebasec.staging`. Do not commit these files (they should be automatically ignored).

## Running the app

- Run `firebase serve` and go to the indicated URL (usually `localhost:5000`).

- If `firebase serve` gives you an authentication error you might need to run `firebase logout` and `firebase login`

## Internal Notes

### Data format

Check the README at https://github.com/staadecker/flatten-scripts for the data format.

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

