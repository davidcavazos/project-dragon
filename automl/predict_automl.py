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

# TODO: Store results in json format
# TODO: convert to png

date_str = time.strftime("%Y%m%d%H%M%S")

automl_client = automl.AutoMlClient()
storage_client = storage.Client()
prediction_client = automl.PredictionServiceClient()

def pdf_to_png(gcs_path):
    """ Converts pdf to png.
    param: gcs_path - str
    """

    pdf_dirname = os.path.dirname(gcs_path)
    pdf_title = os.path.basename(gcs_path)

    pdf_wtout_ext, pdf_ext = os.path.splitext(pdf_title)
    
    if pdf_ext == '.pdf':
        try:
            os.mkdir('./preds')
        except:
            pass
        destination_pdf_name = './preds' + '/' + pdf_title
        destination_img_name = './preds' + '/' + pdf_wtout_ext + '.png'

        # Download pdf
        bucket = storage_client.get_bucket(bucket_name)
        pdf_blob = bucket.blob(output_gcs_path)
        pdf_blob.download_to_filename(destination_pdf_name)

        # Convert pdf to png
        pdf_document = fitz.open(destination_pdf_name)

        page_pixmap = pdf_document.getPagePixmap(0,alpha=False)
        page_pixmap.writePNG(destination_img_name)
        pdf_document.close()

        # Upload png image
        img_gcs_path = pdf_dirname + pdf_wtout_ext + '.png'
        img_blob = bucket.blob(img_gcs_path)
        
        return img_blob.upload_from_filename(destination_img_name)

def predict_automl_model (model_id, bucket_name, gcs_path, score_threshold='0.5'):
    """
    Input
    params: model: model_id 
    params: str bucket_name
    params: str gcs_path: folder_1/folder_n/image_title
    params: str score_threshold: Classification decision
    """

    pdf_dirname = os.path.dirname(gcs_path)
    pdf_title = os.path.basename(gcs_path)

    pdf_wtout_ext, pdf_ext = os.path.splitext(pdf_title)
    
    if pdf_ext == '.pdf':
        gcs_path = pdf_dirname + pdf_wtout_ext + '.png'
    
    # Get the full path of the model.
    model_full_id = automl_client.model_path(
        project_id, compute_region, model_id)

    # Read the image and assign to payload
    bucket = storage_client.get_bucket(bucket_name)
    blob = bucket.blob(gcs_path)
    content = blob.download_as_string()
    
            
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


if __name__ == '__main__':

    parser = argparse.ArgumentParser(description='Augmentation data schema')

    parser.add_argument('--project_id', required=True,
                        help='GCP project ID that will host the Application')

    parser.add_argument('--compute_region', required=False,
                        help='Compute region that will host the Application')

    parser.add_argument('--bucket_name', required=True,
                        help='GCS bucket name without gs://')

    parser.add_argument('--model_id', required=True,
                        help='GCS path of the image to predict on (without bucket name)')

    parser.add_argument('--gcs_path', required=False,
                        help='GCS path of the image to predict on.')

    parser.add_argument('--score_threshold', required=False, type=str,
                        help='Classification threshold for model decision.\
                        Must be 0 < score_threshold < 1. \
                        Must be string(float) ')

    args = parser.parse_args()
    
    project_location = automl_client.location_path(project_id, compute_region)

    project_id = args.project_id
    compute_region = args.compute_region
    bucket_name = args.bucket_name
    model_id = args.model_id
    gcs_path = args.gcs_path
    score_threshold = args.score_threshold

    # Convert pdf to png if required
    pdf_to_png(gcs_path)

    # Predict class
    pred_response, model_id = predict_automl_model(model_id, bucket_name, 
                                        gcs_path, score_threshold)


