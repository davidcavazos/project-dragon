# Project DocEx

## Development environment

Before you start, make sure you have the following installed:
* [Google Cloud SDK](https://cloud.google.com/sdk/install)
* [Node JS](https://nodejs.org/en/download/)
* [Angular JS](https://angular.io/guide/quickstart)
* [Python 2](https://www.python.org/downloads/)

Test your development environment.

```sh
gcloud version
python2 --version
node --version
ng version
```

## Setup

First, you will need to [create a new Google Cloud project](https://cloud.google.com/resource-manager/docs/creating-managing-projects).

```sh
PROJECT_ID=your-project-id
gcloud projects create $PROJECT_ID

```

Once you have a project, you will also need to [create a Cloud Storage bucket](https://cloud.google.com/storage/docs/creating-buckets).
```sh
BUCKET_NAME=your-bucket-name
gsutil mb gs://$BUCKET_NAME
```

Create the Pub/Sub topic and subscription to train model.
```sh
ML_ENGINE_TOPIC=your-automl-topic-name
gcloud pubsub topics create projects/$PROJECT_ID/topics/$ML_ENGINE_TOPIC
gcloud pubsub subscriptions create projects/$PROJECT_ID/subscriptions/$ML_ENGINE_TOPIC
```

Create the Pub/Sub topic and subscription to convert pdf to image.
```sh
PDF_CONVERTER_TOPIC=your-pdf-converter-topic-name
gcloud pubsub topics create projects/$PROJECT_ID/topics/$PDF_CONVERTER_TOPIC
gcloud pubsub subscriptions create projects/$PROJECT_ID/subscriptions/$PDF_CONVERTER_TOPIC
```

## Deploying PDF to Image converter Colud Function

Follow below steps to create trigger on input bucket to convert pdf file to image.

1. Enable the Cloud Functions API.

2. Update components
```sh
gcloud components update

```

3. Change to the directory that contains the Cloud Functions sample code:
```sh
cd pdf-converter
```

4. Deploy cloud function
```sh
gcloud functions deploy pdf-converter --runtime nodejs10 --trigger-resource $BUCKET_NAME --trigger-event google.storage.object.finalize
```

## Deploying PDF to Image on Compute Engine

1. Create compute engine and SHH it

2. Follow guide.md steps to setup compute engine environment and dependencies.

3. Clone this project and change to directory pdf-conveter

4. Install dependencies and run project.

```sh
screen
npm install
npm install pm2 --g
pm2 pdf-to-image.js
```

## Deploying AutoML Train Model to Compute Engine 

1. Create compute engine and SHH it

2. Clone this project and change to directory auto-ml-train

3. Follow README.md steps to setup compute engine environment and dependencies.

4. Install dependencies and run project.

```sh
screen
bash setup.sh
```
## Deploying to App Engine

Deploying will take a couple minutes, but after that the application will autoscale to match the current load of the application.

```sh
# Build the Angular web application.
cd ui
npm install
ng build --prod

# Build the Middleware node application
cd ../middleware
npm install
gcloud app deploy
```