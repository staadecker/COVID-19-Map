# This script creates a sample dataset mapping postal code FSA to a random number of pending testing cases

import json
import random
import time

MAX_NUMBER = 1000

generated_data = {}

with open('../postal_code_boundries/v2/postal_code_boundaries.json') as file:
    data = json.load(file)

    for key in data.keys():
    # fill generated_data with: key -> [#self-isolating, #severe conditions, #mild conditions]
        if random.random() < 0.1:
            num_isolated = random.randint(0, MAX_NUMBER)
            num_severe = int(num_isolated*0.8)
            num_mild = num_isolated - num_severe
            generated_data[key] = (num_isolated, num_severe, num_mild)
        else:
            generated_data[key] = (0,0,0)

full_data = {"time": time.time(), "max": MAX_NUMBER, "fsa": generated_data}

with open('in_self_isolation_SAMPLE.js', 'w') as file:
    output_string = json.dumps(full_data)
    file.write("data_in_self_isolation_sample = '"+output_string + "';")
