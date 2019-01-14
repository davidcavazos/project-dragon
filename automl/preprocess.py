import os
import time
import shutil
import sys
import argparse


import fitz 
import csv
from google.cloud import storage 
from PIL import Image
from math import ceil
from imgaug import augmenters as iaa
import imgaug as ia
import numpy as np

storage_client = storage.Client()

# Data Augmentation script from imgaug repo

#Sometimes(0.5, ...) applies the given augmenter in 50% of all cases,
# e.g. Sometimes(0.5, GaussianBlur(0.3)) would blur roughly every second image.
sometimes = lambda aug: iaa.Sometimes(0.5, aug)

# Define our sequence of augmentation steps that will be applied to every image
# All augmenters with per_channel=0.5 will sample one value _per image_
# in 50% of all cases. In all other cases they will sample new values
# _per channel_.
seq = iaa.Sequential(
    [
        # apply the following augmenters to most images
        #iaa.Fliplr(0.5), # horizontally flip 50% of all images
        #iaa.Flipud(0.2), # vertically flip 20% of all images
        # crop images by -5% to 10% of their height/width
        # sometimes(iaa.CropAndPad(
        #     percent=(-0.05, 0.05),
        #     pad_mode=ia.ALL,
        #     pad_cval=(0, 255)
        # )),
        sometimes(iaa.Affine(
            scale={"x": (0.9, 1.1), "y": (0.9, 1.1)}, # scale images to 90-110% of their size, individually per axis
            #translate_percent={"x": (-0.2, 0.2), "y": (-0.2, 0.2)}, # translate by -20 to +20 percent (per axis)
            rotate=(-20, 20), # rotate by -20 to +20 degrees
            shear=(-4, 4), # shear by -16 to +16 degrees
            order=[0, 1], # use nearest neighbour or bilinear interpolation (fast)
            cval=(0, 255), # if mode is constant, use a cval between 0 and 255
            mode=ia.ALL # use any of scikit-image's warping modes (see 2nd image from the top for examples)
        )),
        # execute 0 to 5 of the following (less important) augmenters per image
        # don't execute all of them, as that would often be way too strong
        iaa.SomeOf((0, 5),
            [
                sometimes(iaa.Superpixels(p_replace=(0, 1.0), n_segments=(20, 200))), # convert images into their superpixel representation
                iaa.OneOf([
                    iaa.GaussianBlur((0, 3.0)), # blur images with a sigma between 0 and 3.0
                    iaa.AverageBlur(k=(2, 7)), # blur image using local means with kernel sizes between 2 and 7
                    iaa.MedianBlur(k=(3, 11)), # blur image using local medians with kernel sizes between 2 and 7
                ]),
                iaa.Sharpen(alpha=(0, 1.0), lightness=(0.75, 1.5)), # sharpen images
                iaa.Emboss(alpha=(0, 1.0), strength=(0, 2.0)), # emboss images
                # search either for all edges or for directed edges,
                # blend the result with the original image using a blobby mask
                iaa.AdditiveGaussianNoise(loc=0, scale=(0.0, 0.05*255), per_channel=0.5), # add gaussian noise to images
                iaa.Invert(0.05, per_channel=True), # invert color channels
                iaa.Add((-10, 10), per_channel=0.5), # change brightness of images (by -10 to 10 of original value)
                # either change the brightness of the whole image (sometimes
                # per channel) or change the brightness of subareas
                iaa.OneOf([
                    iaa.Multiply((0.5, 1.5), per_channel=0.5),
                    iaa.FrequencyNoiseAlpha(
                        exponent=(-4, 0),
                        first=iaa.Multiply((0.5, 1.5), per_channel=True),
                        second=iaa.ContrastNormalization((0.5, 2.0))
                    )
                ]),
                iaa.ContrastNormalization((0.5, 2.0), per_channel=0.5), # improve or worsen the contrast
                iaa.Grayscale(alpha=(0.0, 1.0)),
                sometimes(iaa.PerspectiveTransform(scale=(0.01, 0.1)))
            ],
            random_order=True
        )
    ],
    random_order=True
)


def pdf_to_png(pdf_filename,version):
    """ Converts pdf to png.
    param: pdf_filename - str
    param: version - Version of the dataset
    """

    pdf_dirname = os.path.dirname(pdf_filename)
    pdf_title = os.path.basename(pdf_filename)

    pdf_wtout_ext, pdf_ext = os.path.splitext(pdf_title)
    
    if pdf_ext == '.pdf':
        try:
            os.mkdir('{}/img{}'.format(pdf_dirname,version))
        except:
            pass
        img_filename = '{}/img{}/{}.png'.format(pdf_dirname,version,pdf_wtout_ext)
        pdf_document = fitz.open(pdf_filename)

        page_pixmap = pdf_document.getPagePixmap(0,alpha=False)
        page_pixmap.writePNG(img_filename)
        return pdf_document.close()


def augment_dataset(label, tot_aug_img,version):
    """ Data augmentation script.
    param: label - str - folder name
    param: tot_aug_img - int - Augmentation size
    param: version - int - version of the dataset
    """
    nbr_files = []
    for fileList in os.listdir('{}/{}/img{}'.format(prefix_local_path,label,version)):
        nbr_files.append(fileList)

    for i in range(0,len(nbr_files)):
        # Setting default 1000 images per class
        if (tot_aug_img-len(nbr_files)) > 0:
            # Augmenting by the factor that is dependent on nbr images
            # already present
            for augment_idx in range(0,int(ceil((tot_aug_img-len(nbr_files))/len(nbr_files)))):
                try:
                    #print (nbr_files[i])
                    image = np.array(Image.open('{}/{}/img{}/{}'.format(prefix_local_path,label,version,nbr_files[i])))
                    # If image is grayscale, resize to 3 channel np array
                    if len(image.shape) ==2:
                        image = np.resize(image, (image.shape[0], image.shape[1], 3))
                    
                    # data aug methods requires 3D arrays
                    result = Image.fromarray(seq.augment_image(image).astype('uint8'),'RGB')
                    #print('augmented_img_created')
                    result.save("{}/{}/img{}/aug{}_{}".format(prefix_local_path,label,version,augment_idx,nbr_files[i]))
                except Exception as e:
                    print (e)

def append_to_csv(pdf_filename,version):
    """ Add images to training dataset.
    param: pdf_filename - str - img local path
    param: version - version of the dataset
    """

    pdf_title = os.path.basename(pdf_filename)
    pdf_wtout_ext, pdf_ext = os.path.splitext(pdf_title)

    gcs_path = 'gs://{}/images_v{}/{}.png'.format(bucket_name, version, pdf_wtout_ext)

    if os.path.isfile('./{}-v{}.csv'.format(dataset_name,version)) != True:
        with open('./{}-v{}.csv'.format(dataset_name,version),mode='w') as newFile:
            newFile_writer = csv.writer(newFile, delimiter=',')
            newFile_writer.writerow([gcs_path, folder_name])
    else:
    	with open('{}-v{}.csv'.format(dataset_name,version), mode='a') as existFile:
    	    existFile_writer = csv.writer(existFile, delimiter=',')
	    existFile_writer.writerow([gcs_path, folder_name])

def upload_img(pdf_filename, bucket_name,version):
    """Upload img to GCS
    param: pdf_filename - str - img local path
    param: bucket_name - str - GCS bucket name
    param: version - version of the dataset
    """
    
    file_dirname = os.path.dirname(pdf_filename)
    file_title = os.path.basename(pdf_filename)
    pdf_wtout_ext, pdf_ext = os.path.splitext(file_title)
    
    bucket = storage_client.get_bucket(bucket_name)

    if any(element.startswith('img{}'.format(version)) for  element in file_dirname.rsplit('/')):
    	img_local_path = '{}/{}.png'.format(file_dirname, pdf_wtout_ext)
    else:
    	img_local_path = '{}/img{}/{}.png'.format(file_dirname,version, pdf_wtout_ext)
    
    output_gcs_path = 'images_v{}/{}.png'.format(version,pdf_wtout_ext)
    blob = bucket.blob(output_gcs_path)
    
    return blob.upload_from_filename(img_local_path)

def upload_csv(dataset_name, version, bucket_name):
    """ Upload csv aggregating all images in a dataset
    param: dataset_name - str -
    param: version - version of the dataset
    param: bucket_name - str - GCS bucket name
    """

    bucket = storage_client.get_bucket(bucket_name)
    csv_local_path = './{}-v{}.csv'.format(dataset_name,version)
    output_gcs_path = 'csv/{}-v{}.csv'.format(dataset_name,version)
    blob = bucket.blob(output_gcs_path)
    
    return blob.upload_from_filename(csv_local_path)

if __name__ == '__main__':

    parser = argparse.ArgumentParser(description='Augmentation data schema')

    parser.add_argument('--project_id', required=True,
                        help='GCP project ID that will host the Application')

    parser.add_argument('--compute_region', required=False,
                        help='Compute region that will host the Application')

    parser.add_argument('--bucket_name', required=True,
                        help='GCS bucket name without gs://')

    parser.add_argument('--prefix_local_path', required=True,
                        help='prefix of the master folder that contains all raw images')

    parser.add_argument('--version', required=True, type=int,
                        help='Local path that contains raw images')

    parser.add_argument('--dataset_name', required=True,
                        help='Dataset name that will be used to name csv file.')

    parser.add_argument('--optimal_augmentation', required=True, type=bool,
                        help='Optimal augmentation defines full or partial optimization goal.\
                        Can be time consuming.')

    args = parser.parse_args()
    
    project_id = args.project_id
    compute_region = args.compute_region
    dataset_name = args.dataset_name
    bucket_name = args.bucket_name 
    prefix_local_path = args.prefix_local_path
    version = args.version
    optimal_augmentation = args.optimal_augmentation

    if optimal_augmentation == True:
        aug_size = 1000
    else:
        aug_size = 100
    #e.g
    # project_id = 'project-dragon-2019'
    # compute_region = 'us-west1'
    # dataset_name = 'invoices'
    # bucket_name = 'project-dragon-2019-vcm'
    # local_path = './docs-project-dragon'
    # version = 2

    # TODO: Incremental img processing

    # Clean directory 
    for folder_name in os.listdir(prefix_local_path):
    for sub_folder in os.listdir('{}/{}/'.format(prefix_local_path,folder_name)):
        try:
            shutil.rmtree('{}/{}/{}'.format(prefix_local_path,folder_name,sub_folder))
        except:
            pass

    # Conversion pdf to png step
    for folder_name in os.listdir('{}/'.format(prefix_local_path)):
        for path, subdirs, files in os.walk("{}/{}".format(prefix_local_path,folder_name)):
            for name in files:
                #print (name)
                pdf_filename = str(os.path.join(path, name))
                pdf_to_png(pdf_filename,version)


    for folder_name in os.listdir(prefix_local_path):
        print ('Augmenting this folder: ' + folder_name)
        augment_dataset(folder_name,tot_aug_img = aug_size,version)
        print (folder_name + 'Augmentation: DONE')
        for path, subdirs, files in os.walk("{}/{}".format(prefix_local_path,folder_name)):
    	for name in files:
    	    pdf_filename = str(os.path.join(path, name))
    	    #print ('Appending to csv:')
    	    append_to_csv(pdf_filename,version)
    	    #print ('Uploading to GCS')
    	    upload_img(pdf_filename,bucket_name,version)
    
    # Final step upload csv that aggregates all data 
    upload_csv(dataset_name,version,bucket_name)
    print ('Preprocessing: DONE. Ready for training.')

