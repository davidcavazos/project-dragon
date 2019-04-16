# Preprocessing and training AutoML models

This is NOT an official Google product

- This repository contains documents belonging to the GoogleNext Demo - Docex. A product that search , classify and visualize concepts from Free-Form text. 
- To use this application , one should have active Google account, a project on GCP with billing enabled. 

## Setup GitHub Repo on VM
- Wait for 5 minutes after the VM setup is complete and then attempt SSH into the VM using command below

```shell
gcloud compute --project $PROJECT_ID ssh --zone $PROJECT_ZONE $INSTANCE_NAME
```

## Install required packages 

```bash
pip install -r requirement.txt
```

- Specify all the environments variables DATASET_NAME, MODEL_NAME_PREFIX, PUBSUB_VERIFICATION_TOKEN

## create_directory.py

- Python script that creates directory structure for storing documents.

### Directory structure in VM that would be created:
```
├── main_folder_name				# folder downloaded from gcs that contains all labeled images
	├── label1_folder_name			# folder segmentation per document label
		├── document_name.pdf 		# document file
	├── label2_folder_name			# folder segmentation per document label
		├── ...
├── preds							# prediction folder that contain all document to be predicted
	├── document_file.pdf 			# document file
	├── ...
```

## preprocess.py

- Python script that takes pdf/image from local, converts them to png format,
Augments them so that each label has 1000 images, creates a csv, 
uploads the csv and images dataset to bucket for training.

### version_counter.json

- It takes in account the version of the AUTOML model being trained

## Modeling.py
- Python script that creates the Automl classification model using dataset on bucket and returns a Model ID

## main.py 

- Main Python Script to run the whole pipeline of docex.

## setup.sh

- Bash script to start the whole pipeline as service . Before this command specify your working directory path in *mysystemd.service*  

```bash 
bash setup.sh
```


