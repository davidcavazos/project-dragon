Copyright 2018 Google LLC. This software is confidential, was prepared for
demonstration purposes, and is not for distribution except as otherwise agreed.
Your use of it is subject to your agreements with Google.

# project-geo-vision

Project for all activities and code related to the Vision project  

> GCS folder organization
```
.
├── documents_bucket                     
	├── dirty-docs                       # destination of initial upload from website
	├── pending-docs                     # location of documents pending to be processed
	├── processed-docs                   # location of processed pdf documents
	├── vision-results                   # location of vision API results
	├── raw-text-files                   # location of raw extracted txt from pdf

```

## Pre-requisites

`pip install -r requirements.txt`

## Executing the processing

Running the text extraction on documents uploaded to the following GCS path:
`gs://[BUCKET_NAME]/dirty-docs`

```shell
python pdf_to_text.py --project_id [PROJECT_ID] --bucket_name [BUCKET_NAME] --batch_size [BATCH_SIZE]
```
