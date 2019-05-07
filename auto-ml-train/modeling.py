'''
Creates the Automl classification model using dataset on bucket
'''
import argparse
import os
import shutil
import time

from google.cloud import automl_v1beta1 as automl
from google.cloud import storage

DATE_STR = time.strftime("%Y%m%d%H%M%S")

AUTOML_CLIENT = automl.AutoMlClient()
STORAGE_CLIENT = storage.Client()
PREDICTION_CLIENT = automl.PredictionServiceClient()

# A resource that represents Google Cloud Platform location.


def create_automl_dataset(project_location, project_id, compute_region,
                          dataset_name, classification_type="MULTICLASS"):
    """Create a placeholder dataset.
    Input
    params: str project_id
    params: str compute_region
    params: str dataset_name
    params: str classification_type: MULTICLASS or MULTILABEL
    """

    # Specify the image classification type for the dataset.
    dataset_metadata = {"classification_type": classification_type}
    # Set dataset name and metadata of the dataset.
    my_dataset = {
        "display_name": dataset_name,
        "image_classification_dataset_metadata": dataset_metadata,
    }

    # First verify that the name doesnt already exists
    list_dataset = AUTOML_CLIENT.list_datasets(project_location)
    for dataset in list_dataset:
        if dataset.display_name == dataset_name:
            dataset_id = dataset.name.split("/")[-1]
            print("dataset name already used by dataset id: {}".format(dataset_id))

            dataset_full_id = AUTOML_CLIENT.dataset_path(project_id,
                                                         compute_region,
                                                         dataset_id)

            # Get complete detail of the dataset.
            dataset_blob = AUTOML_CLIENT.get_dataset(dataset_full_id)
            return dataset_blob

    # Create new one
    dataset_blob = AUTOML_CLIENT.create_dataset(project_location, my_dataset)
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
    # Get the full path of the dataset.
    dataset_full_id = AUTOML_CLIENT.dataset_path(
        project_id, compute_region, dataset_id
    )

    # Get the multiple Google Cloud Storage URIs.
    input_uris = gcs_csv_path.split(",")
    input_config = {"gcs_source": {"input_uris": input_uris}}

    # Import data from the input URI.
    response = AUTOML_CLIENT.import_data(dataset_full_id, input_config)

    print("Processing import...")
    # synchronous check of operation status.
    return "Data imported. {}".format(response.result())


def train_model(project_id, compute_region, model_name_prefix, dataset_blob,
                version=1, train_budget='1'):
    """Train model.
    Input
    params: dataset_blob
    params: int version
    train_budget: str train_budget: needs to be integer
    """
    project_location = AUTOML_CLIENT.location_path(project_id, compute_region)
    dataset_id = dataset_blob.name.split("/")[-1]
    model_name = model_name_prefix + str(version)

    models_list = AUTOML_CLIENT.list_models(project_location)
    for model in models_list:
        if model.display_name == model_name:
            version += 1
            model_name = model_name_prefix + str(version)

    # Set model name and model metadata for the image dataset.
    my_model = {
        "display_name": model_name,
        "dataset_id": dataset_id,
        "image_classification_model_metadata":
        {"train_budget": train_budget}
        if train_budget
        else {},
    }

    # Create a model with the model metadata in the region.
    print('My Model Info', my_model)
    model = AUTOML_CLIENT.create_model(project_location, my_model)
    print("Training operation name: {}".format(model.operation.name))
    return model


def make_model(project_id, compute_region, dataset_name, bucket_name,
               train_budget, model_name_prefix, version, sess_id):
    '''
    this function takes all the arguments are creates datasets and model on autoML
    '''

    project_location = AUTOML_CLIENT.location_path(project_id, compute_region)
    csv_gcs_path = 'gs://{}/csv/{}-v{}.csv'.format(
        bucket_name, dataset_name, version)

    # Create dataset placeholder
    dataset_blob = create_automl_dataset(
        project_location, project_id, compute_region, dataset_name)

    # Import images to dataset placeholder
    import_dataset(project_id, compute_region, dataset_blob, csv_gcs_path)
    print('Importing dataset requires 15 min to sync.')
    time.sleep(900)

    print('Training is starting now.')
    # Train model
    model = train_model(project_id, compute_region, model_name_prefix,
                        dataset_blob, version, train_budget=train_budget)
    print('DONE!')
    print('Use this model id for prediction: {}'.format(
        model.operation.name.split("/")[-1]))
    # remove dirs
    print("Finally Removing the local directory for the user Session Id: {}".format(sess_id))
    shutil.rmtree(os.path.join(os.getcwd(), sess_id))

    return model.operation.name.split("/")[-1]


if __name__ == '__main__':

    PARSER = argparse.ArgumentParser(description='Create an AutoML schema')

    PARSER.add_argument('--project_id', required=True,
                        help='GCP project ID that will host the Application')

    PARSER.add_argument('--compute_region', required=False,
                        help='Compute region that will host the Application')

    PARSER.add_argument('--dataset_name', required=True,
                        help='Only underscore _ and numbers are allowed as special characters.\
                        Note: date will be concatenated to the dataset name')

    PARSER.add_argument('--bucket_name', required=True,
                        help='GCS bucket name without gs://')

    PARSER.add_argument('--model_name_prefix', required=True,
                        help='Only underscore _ and numbers are allowed as special characters.\
                Note: that date will be concatenated to the model name')

    PARSER.add_argument('--train_budget', type=int, required=True,
                        help='Training hours budget.')

    PARSER.add_argument('--version', required=True, type=int,
                        help='Local path that contains raw images')

    PARSER.add_argument('--sess_id', required=True,
                        help='unique session id for different users')

    ARGS = PARSER.parse_args()

    PROJECT_ID = ARGS.project_id
    COMPUTE_REGION = ARGS.compute_region
    DATASET_NAME = ARGS.dataset_name
    BUCKET_NAME = ARGS.bucket_name
    TRAIN_BUDGET = ARGS.train_budget
    MODEL_NAME_PREFIX = ARGS.model_name_prefix + '_' + DATE_STR
    VERSION = ARGS.version
    SESS_ID = ARGS.sess_id

    MODEL_ID = make_model(PROJECT_ID, COMPUTE_REGION, DATASET_NAME,
                          BUCKET_NAME, TRAIN_BUDGET, MODEL_NAME_PREFIX, VERSION, SESS_ID)
