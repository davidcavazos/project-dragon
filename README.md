# Preprocessing and training AutoML models

- This repository contains documents belonging to the GoogleNext Demo - Docex. A product that search , classify and visualize concepts from Free-Form text. 
To use this application , one should have active Google account, a project on GCP with billing enabled and a deep learning VM

## Automlsetup.sh
- Bash script to enable automl for your project
```shell
bash automlsetup.sh
```

## Setup GitLab Repo on VM
- Wait for 5 minutes after the VM setup is complete and then attempt SSH into the VM using command below
```shell
gcloud compute --project $PROJECT_ID ssh --zone $PROJECT_ZONE $INSTANCE_NAME
```

- Inside the VM's shell, clone repo by following command prompts (Clone with https)
```shell
git clone https://github.com/davidcavazos/project-dragon.git
```

## Install required packages

```bash
pip install -r requirements.txt
```
## setup.sh

- Bash script to start the service . Use this command to start the service 
```bash 
bash setup.sh
```
## create_directory.py

- Python script that creates directory structure for storing documents

### Directory tructure of your VM:
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

### project-dragon-2019-e3f6ead0cfb0 .json

- Service account credentials for running the docex application

## config.py

- Python script to import the constant variables

## create_directory.py

- Python script that creates directory structure for storing documents

## main.py 

- Main Python Script to run the whole pipeline of docex

## preprocess.py

- Python script that takes pdf/img from local, convertS them to png,
Augments them so that each label has 1000 images, creates a csv, 
uploads the csv and images dataset to bucket for training 


### version_counter.json

- It takes in account the version of the AUTOML model being trained

## Modeling.py
- Python script that creates the Automl classification model using dataset on bucket and returns a Model ID



