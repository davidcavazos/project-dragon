import io
import logging
import os
import re
import sys
import argparse
import json

from datetime import timedelta, datetime

import PyPDF2
import pytz
import requests
from google.cloud import storage, vision
from google.protobuf import json_format



def pdf_to_text(bucket_name, batch_size=2):
    """ 3 steps 
    Step 1: Move incremental files to correct location
    Step 2: OCR
    Step 3: Concatenate text together from OCR response

    """
    
    # TODO: Ideally remove step 1 and dump pdf file in pending-docs folder

    # Step 1: copy to pending folder
    bucket = storage_client.get_bucket(bucket_name)
    blob_lst = list(bucket.list_blobs(prefix='dirty-docs/'))

    dirty_file_ids = []
    pending_file_ids = []
    for blob in blob_lst:
        if len(blob.name.split('/')[-1]) > 1:
            dirty_file_ids.append(blob.name.split('/')[-1].split('.')[0])
            pending_file_ids.append(blob.name.split('/')[-1].split('.')[0].replace(" ", "_").replace("(","").replace(")",""))

    for file_id in dirty_file_ids:
        source_blob = bucket.get_blob('dirty-docs/' + file_id + '.pdf')
        new_path = 'pending-docs/' + file_id.replace(" ", "_").replace("(","").replace(")","") + '.pdf'
        bucket.copy_blob(blob=source_blob, destination_bucket=bucket, new_name=new_path)

    # Step 2: Start text extraction process
    mime_type = 'application/pdf'
    vision_client = vision.ImageAnnotatorClient()

    feature = vision.types.Feature(type= vision.enums.Feature.Type.DOCUMENT_TEXT_DETECTION)

    operations_dict = {}

    # send request to Vision API for each pdf
    for file_id in pending_file_ids:
        uri_source = 'gs://' + bucket_name + '/pending-docs/' + file_id + '.pdf'
        gcs_source = vision.types.GcsSource(uri=uri_source)

        input_config = vision.types.InputConfig(gcs_source= gcs_source, mime_type=mime_type)
        uri_destination = 'gs://' + bucket_name + '/vision-results/' + file_id + '/'
        gcs_destination = vision.types.GcsDestination(uri=uri_destination)
        output_config = vision.types.OutputConfig(gcs_destination=gcs_destination,
                                                  batch_size=batch_size)

        async_request = vision.types.AsyncAnnotateFileRequest(features=[feature],
                                                              input_config=input_config,
                                                              output_config=output_config)

        operation = vision_client.async_batch_annotate_files(requests=[async_request])

        operations_dict['{}'.format(file_id)] = operation

    bucket = storage_client.get_bucket(bucket_name=bucket_name)

    for file_id in pending_file_ids:
        print(file_id)
        #try:
        failed_job = False
        source_file_path = 'pending-docs/' + file_id + '.pdf'
        source_blob = bucket.get_blob(source_file_path)
        stream = io.BytesIO(source_blob.download_as_string())
        read_pdf = PyPDF2.PdfFileReader(stream)
        timeout = read_pdf.getNumPages() * 10

        logging.info('Time out ' + str(timeout) + ' for file ' + file_id)

        # Check if the operation is done
        operations_dict['{}'.format(file_id)].result(timeout=timeout)
        blob_list = list(bucket.list_blobs(prefix='vision-results/{}/'.format(file_id)))
        #print (blob_list)
        # sort blob list by page numbers
        #blob_list.sort(key=int(re.match(r"vision-results/.+/output-(\d+)-to-(\d+).json", blob.name).group(1)))
        text_to_upload = ''
        bounding_box_to_upload = ''

        document_json = {}

        # Step 3: Extract text from json
        for blob in blob_list:
            if len(blob.name.split('/')[-1]) > 1:
                json_string = blob.download_as_string()
                response = json_format.Parse(
                    json_string, vision.types.AnnotateFileResponse())
                #print(response)
                page_count = 0
                for page in response.responses:
                    page_count += 1
                    annotation = page.full_text_annotation

                    # create each page content
                    document_json['page_{}'.format(page_count)]= {}
                    
                    # add text of each page 
                    document_json['page_{}'.format(page_count)]['text']=annotation.text

                    # add bounding boxes of each page
                    document_json['page_{}'.format(page_count)]['bounding_boxes']={}
                    nbr_blocks = len(annotation.pages[0].blocks)

                    for block_idx in range(nbr_blocks):
                        document_json['page_{}'.format(page_count)]['bounding_boxes']['block_{}'.format(str(block_idx))] = annotation.pages[0].blocks[block_idx].bounding_box


        text_file = bucket.blob('cured_vision_output/' + file_id + '.txt')
        text_file.upload_from_string(str(document_json))

        # remove file from pending docs to processed docs
        new_pdf_path = 'processed-docs/' + file_id + '.pdf'
        bucket.copy_blob(blob=source_blob, destination_bucket=bucket, new_name=new_pdf_path)
        source_blob.delete()

        # except:
        #     # move pdf to a failed directory
        #     new_pdf_path = 'failed-docs/' + file_id + '.pdf'
        #     bucket.copy_blob(blob=source_blob, destination_bucket=bucket, new_name=new_pdf_path)
        #     source_blob.delete()


if __name__ == '__main__':

    parser = argparse.ArgumentParser(description='Arguments to extract text from pdf')

    parser.add_argument('--project_id', required=True,
                        help='GCP project ID that will host the Application')

    parser.add_argument('--bucket_name', required=True,
                        help='GCS bucket name without gs://')

    parser.add_argument('--batch_size', required=True, type=int,
                        help='Number of pages processed by vision at the same time.')


    args = parser.parse_args()
    
    storage_client = storage.Client()

    project_id = args.project_id
    bucket_name = args.bucket_name
    batch_size = args.batch_size


    pdf_to_text(bucket_name, batch_size)


