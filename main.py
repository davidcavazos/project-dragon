'''
Main Python Script to run the whole pipeline
'''
import json

from tinydb import TinyDB, Query

from flask import Flask
from google.cloud import pubsub_v1

from config import (BUCKET_NAME, COMPUTE_REGION2,
                    DATASET_NAME, MODEL_NAME_PREFIX, OPTIMAL_AUGMENTATION,
                    PROJECT_ID)
from create_directory import create_dir
from modeling import make_model
# from app import app
from preprocess import preprocess_automl


APP = Flask(__name__)

PUBSUB_VERIFICATION_TOKEN = 'test-pubsub-token'
PUBSUB_TOPIC = 'automl-train'
PUBSUB_SUBSCRIBER = 'automl-subscriber'
PROJECT = 'project-dragon-2019'


SUBSCRIBER = pubsub_v1.SubscriberClient()
TOPIC_NAME = 'projects/{project_id}/topics/{topic}'.format(
    project_id=PROJECT,
    topic=PUBSUB_TOPIC,  # Set this to something appropriate.
)

SUBSCRIPTION_NAME = 'projects/{project_id}/subscriptions/{sub}'.format(
    project_id=PROJECT,
    sub=PUBSUB_SUBSCRIBER,  # Set this to something appropriate.
)


def callback(message):
    """
    Function to retrieved the published message and run the
    whole pipeline to create a model in AutoML
    params: message - string containing train budget and session ID
    """
    print(message.data)
    message.ack()
    input_dict = json.loads(message.data)
    print("All the logic to be written here")
    db = TinyDB('version_counter.json')
    try:
        version = db.all()[0]['version']
        print('version',version)
        train_budget = int(input_dict["train_budget"])
        sess_id = input_dict["session_id"]
        print("Making local dir structure for preprocessing file")
        prefix_local_path = str(create_dir(sess_id, PROJECT_ID))
        print(prefix_local_path)
        print("Entering augmentation")
        _, _ = preprocess_automl(
            DATASET_NAME, BUCKET_NAME, prefix_local_path,
            version, OPTIMAL_AUGMENTATION)
        model_id = make_model(PROJECT_ID, COMPUTE_REGION2, DATASET_NAME,
                              BUCKET_NAME, train_budget, MODEL_NAME_PREFIX, version, sess_id)
        model_id = str(model_id)

        db.update({'version': version+1})

    except Exception as error_message:
        print('Error: ', error_message)
FUTURE = SUBSCRIBER.subscribe(SUBSCRIPTION_NAME, callback)


if __name__ == "__main__":
    APP.run(debug=True)
