import pandas as pd
import json
from geopy.geocoders import Nominatim

geolocator = Nominatim(user_agent="COVIDScript")

fields = ['health_region', 'province']

df = pd.read_csv('Script/Public_COVID-19_Canada.csv', skipinitialspace=True, usecols=fields)
df.sort_values(by='health_region', inplace=True)

output = {}

for index, row in df.iterrows():
    if row['health_region'] + ', ' + row['province'] in output:
        output[row['health_region'] + ', ' + row['province']][0] += 1
    else:
        if row['health_region'] == "Not Reported" and row['province'] == "Repatriated":
            output[row['health_region'] + ', ' + row['province']] = [1, "N/A", "N/A"]
        elif row['health_region'] == "Not Reported":
            location = geolocator.geocode(row['province'] + ', Canada')
            output[row['health_region'] + ', ' + row['province']] = [1, location.latitude, location.longitude]
        else:
            location = geolocator.geocode(row['health_region'] + ', ' + row['province'])
            if location is None:
                location = geolocator.geocode(row['province'] + ', Canada')
            output[row['health_region'] + ', ' + row['province']] = [1, location.latitude, location.longitude]

with open('confirmed.json', 'w') as outfile:
    json.dump(output, outfile)
