# Preprocessing and training AutoML models

NOTE: Ensure the steps in project-dragon/README.md are completed prior to this.

## Setup Deep learning VM

- Change working directory to project-geo-vision/notebooks
```shell
cd project-dragon/automl
```

- Execute the bash script dl_vm_setup.sh as shown below
```shell
source dl_vm_setup.sh
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

## Download images from GCS to your VM
```shell
gsutil -m cp gs://$BUCKET_NAME/$GCS_PREFIX_OF_FILES ./
```

## Directory tructure of your VM:
```
├── main_folder_name				# folder downloaded from gcs that contains all labeled images
	├── label1_folder_name				# folder segmentation per document label
		├── document_name.pdf 				# document file
	├── label2_folder_name				# folder segmentation per document label
		├── ...
├── preds				# prediction folder that contain all document to be predicted
	├── document_file.pdf 				# document file
	├── ...
```

## Preprocessing 
```bash
python preprocess.py \
--$PROJECT_ID \
--$COMPUTE_REGION \
--'invoices-jan-2019' \
--$BUCKET_NAME \
--$PREFIX_LOCAL_PATH
--1 \
--False
```

## Train your model 
```bash
python modeling.py
--$PROJECT_ID \
--$COMPUTE_REGION \
--'invoices-jan-2019' \
--$BUCKET_NAME \
--'jan_2019_model'\
--1
```

## Predict using a trained model
```bash
python predict_automl.py \
--$PROJECT_ID \
--$COMPUTE_REGION \
--$BUCKET_NAME \
--'MVP_model_201901090036452'
--'predict_img/1132019/invoice_id.pdf'
--'0.2'

```