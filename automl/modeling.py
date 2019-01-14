import pandas as pd
import numpy as np
from google.cloud import automl_v1beta1 as automl
from google.cloud import storage

import os
import time
import shutil
import sys
import argparse

import fitz
import cv2 
from PIL import Image
import csv
import matplotlib.pyplot as plt

import scipy.misc

date_str = time.strftime("%Y%m%d%H%M%S")

automl_client = automl.AutoMlClient()
storage_client = storage.Client()
prediction_client = automl.PredictionServiceClient()

#A resource that represents Google Cloud Platform location.



def create_automl_dataset(project_id, compute_region, 
    dataset_name, classification_type ="MULTICLASS"):
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

#dataset_blob = create_automl_dataset(project_id,compute_region,dataset_name)

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
    return "Data imported. {}".format(response.result())

# import_dataset(project_id, compute_region,
#     dataset_blob, 'gs://project-dragon-2019-vcm/csv/dragon-2019-v2.csv')
# print ('Importing dataset requires 15 min to sync.')
# time.sleep(900)

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

#model = train_model(dataset_blob, version=2, train_budget=3)


if __name__ == '__main__':

    parser = argparse.ArgumentParser(description='Create an AutoML schema')

    parser.add_argument('--project_id', required=True,
                        help='GCP project ID that will host the Application')

    parser.add_argument('--compute_region', required=False,
                        help='Compute region that will host the Application')

    parser.add_argument('--dataset_name', required=True,
                        help='Only underscore _ and numbers are allowed as special characters.\
                        Note: date will be concatenated to the dataset name')

    parser.add_argument('--bucket_name', required=True,
                        help='GCS bucket name without gs://')

    parser.add_argument('--model_name_prefix', required=True,
                help='Only underscore _ and numbers are allowed as special characters.\
                Note: that date will be concatenated to the model name')

    parser.add_argument('--train_budget', type=int, required=True,
                help='Training hours budget.')

    args = parser.parse_args()
    
    project_id = args.project_id
    compute_region = args.compute_region
    dataset_name = args.dataset_name + '_' + date_str
    bucket_name = args.bucket_name
    train_budget = args.train_budget 
    model_name_prefix = args.model_name_prefix + '_' + date_str

    project_location = automl_client.location_path(project_id, compute_region)
    csv_gcs_path = 'gs://{}/csv/{}-v{}.csv'.format(dataset_name,version)

    # Create dataset placeholder
    dataset_blob = create_automl_dataset(project_id,compute_region,dataset_name)

    # Import images to dataset placeholder
    import_dataset(project_id, compute_region, dataset_blob, csv_gcs_path)
    print ('Importing dataset requires 15 min to sync.')
    time.sleep(900)

    print ('Training is starting now.')
    # Train model
    model = train_model(dataset_blob, version=1, train_budget=train_budget)
    print ('DONE!')
    print ('Use this model id for prediction: {}'.format(model.name.split("/")[-1]))
    


    