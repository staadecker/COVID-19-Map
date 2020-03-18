# This script creates a sample dataset mapping postal code FSA to a random number of pending testing cases

import json
import random

generated_data = {}

with open('../postal_code_boundries/v2/postal_code_boundaries.json') as file:
    data = json.load(file)

    for key in data.keys():
        if random.random() < 0.1:
            generated_data[key] = random.randint(0, 100)
        else:
            generated_data[key] = 0

with open('in_self_isolation_SAMPLE.js', 'w') as file:
    output_string = json.dumps(generated_data)
    file.write("data_in_self_isolation_sample = '"+output_string + "';")
