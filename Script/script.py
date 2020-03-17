import pandas as pd
import json

fields = ['health_region', 'province']

df = pd.read_csv('Public_COVID-19_Canada.csv', skipinitialspace=True, usecols=fields)
df.sort_values(by='health_region', inplace=True)

output = {}

for index, row in df.iterrows():
   if row['health_region'] + ', ' + row['province'] in output:
      output[row['health_region'] + ', ' + row['province']] += 1
   else:
      output[row['health_region'] + ', ' + row['province']] = 1


with open('confirmed.json', 'w') as outfile:
    json.dump(output, outfile)
