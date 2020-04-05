function getGSBucketReference(bucket) {
    try {
        const storage = firebase.storage();
        return storage.refFromURL(bucket);
    } catch (error) {
        console.log("Couldn't load firebase.storage. Please use 'firebase serve' to allow Google Cloud Storage Connection");
    }
}

function getGSDownloadURL(bucket_reference, file) {
    return bucket_reference.child(file).getDownloadURL();
}

function bucketRequest(url) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send();
    return JSON.parse(xhr.responseText);
}

async function obtainAndDisplayMaps() {
    const remoteConfig = firebase.remoteConfig();

    remoteConfig.settings = {minimumFetchIntervalMillis: 3600000};
    remoteConfig.defaultConfig = ({'bucket': 'gs://flatten-271620.appspot.com'});

    try {
        await remoteConfig.fetchAndActivate();
    } catch (e) {
        console.log("Issue fetching remote config...");
    }

    const bucket = remoteConfig.getValue('bucket').asString();
    const bucket_reference = getGSBucketReference(bucket);
    form_data_obj = bucketRequest(await getGSDownloadURL(bucket_reference, 'form_data.json'));
    confirmed_data = bucketRequest(await getGSDownloadURL(bucket_reference, 'confirmed_data.json'));

    displayMaps();
    tabs.potential.add_to_map(map);
}

// Calls the function.
obtainAndDisplayMaps();