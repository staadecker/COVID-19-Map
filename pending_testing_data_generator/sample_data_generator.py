# This script creates a sample dataset mapping postal code FSA to a random number of pending testing cases

import json
import random

generated_data = {}

with open('../postal_code_parser/v2/output_boundary_data.json') as file:
    data = json.load(file)

    for key in data.keys():
        if random.random() < 0.1:
            generated_data[key] = random.randint(0, 100)
        else:
            generated_data[key] = 0

with open('sample_pending_testing_data.json', 'w') as file:
    json.dump(generated_data, file)
