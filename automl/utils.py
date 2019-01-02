# TODO: Operationalize code
# TODO: Argument parsing
# TODO: Class style

import pandas as pd
import numpy as np
from google.cloud import automl_v1beta1 as automl
from google.cloud import storage

import os
import argparse
import shutil

import fitz
import cv2 
from PIL import Image
import csv
import matplotlib.pyplot as plt

import scipy.misc

def create_automl_dataset(project_id, compute_region, dataset_name, classification_type ="MULTICLASS"):
    """Create a placeholder dataset.
    Input
    params: str project_id
    params: str compute_region
    params: str dataset_name
    params: str classification_type: MULTICLASS or MULTILABEL
    """
#     project_id = args['project_id']
#     compute_region = args['compute_region']
#     dataset_name = args['dataset_name']

    # Specify the image classification type for the dataset.
    dataset_metadata = {"classification_type": classification_type}
    # Set dataset name and metadata of the dataset.
    my_dataset = {
        "display_name": dataset_name,
        "image_classification_dataset_metadata": dataset_metadata,
    }
    
    # First verify that the name doesnt already exists
    list_dataset = automl_client.list_datasets(project_location)
    for dataset in list_dataset:
        if dataset.display_name == dataset_name:
            dataset_id = dataset.name.split("/")[-1]
            print ("dataset name already used by dataset id: {}".format(dataset_id))
            
            dataset_full_id = automl_client.dataset_path(project_id, 
                                                  compute_region, 
                                                  dataset_id)

            # Get complete detail of the dataset.
            dataset_blob = automl_client.get_dataset(dataset_full_id)
            return dataset_blob
               
    # Create new one
    dataset_blob = automl_client.create_dataset(project_location, my_dataset)
    return dataset_blob

def import_dataset(project_id, compute_region, 
                   dataset_blob, gcs_csv_path):
    """Fill in the dataset placeholder.
    Input
    params: str project_id
    params: str compute_region
    params: dataset_blob: dataset placeholder object
    params: str gcs_csv_path: 'gs://path/to/csv/file.csv'

    Note:
    Automl limit of labels is 5000 per model.
    Automl limit of images is 1 million per model.
    """

    dataset_id = dataset_blob.name.split("/")[-1]
    #project_id = args['project_id']
    #compute_region = args['compute_region']

    # Get the full path of the dataset.
    dataset_full_id = automl_client.dataset_path(
        project_id, compute_region, dataset_id
    )

    # Get the multiple Google Cloud Storage URIs.
    input_uris = gcs_csv_path.split(",")
    input_config = {"gcs_source": {"input_uris": input_uris}}

    # Import data from the input URI.
    response = automl_client.import_data(dataset_full_id, input_config)

    print("Processing import...")
    # synchronous check of operation status.
    return print("Data imported. {}".format(response.result()))


def train_model(dataset_blob, version=1, train_budget='1'):
    """Train model.
    Input
    params: dataset_blob
    params: int version 
    train_budget: str train_budget: needs to be integer
    """
    
    dataset_id = dataset_blob.name.split("/")[-1]
    model_name = model_name_prefix + str(version)
    
    models_list = automl_client.list_models(project_location)
    for model in models_list:
        if model.display_name == model_name:
            version += 1
            model_name = model_name_prefix + str(version)
    
    # Set model name and model metadata for the image dataset.
    my_model = {
        "display_name": model_name,
        "dataset_id": dataset_id,
        "image_classification_model_metadata": \
                                        {"train_budget": train_budget}
        if train_budget
        else {},
    }

    # Create a model with the model metadata in the region.
    model = automl_client.create_model(project_location, my_model)
    print ("Training operation name: {}".format(model.operation.name))
    return model

def predict_automl_model (model, bucket_name, gcs_path,
             local_path=None, score_threshold='0.5'):
    """
    Input
    params: model: model blob
    params: str bucket_name
    params: str gcs_path: folder_1/folder_n/image_title
    params: str local_path
    params: str score_threshold: Classification decision
    """
    model_id = model.name.split("/")[-1]
    # Get the full path of the model.
    model_full_id = automl_client.model_path(
        project_id, compute_region, model_id)

    # Read the image and assign to payload.
    if local_path == None:
        bucket = storage_client.get_bucket(bucket_name)
        blob = bucket.blob(gcs_path)
        content = blob.download_as_string()
    
    else:
        with open(local_path, "rb") as image_file:
            content = image_file.read()
            
    payload = {"image": {"image_bytes": content}}

    # params is additional domain-specific parameters.
    # score_threshold is used to filter the result
    # Initialize params
    params = {}
    if score_threshold:
        params = {"score_threshold": score_threshold}

    pred_response = prediction_client.predict(model_full_id, payload, params)
    print("Prediction results:")
    for result in pred_response.payload:
        print("Predicted class name: {}".format(result.display_name))
        print("Predicted class score: {}".format(result.classification.score))
    return pred_response, model_id

    


    