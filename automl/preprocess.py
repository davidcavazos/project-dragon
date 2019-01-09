import os
import fitz 
import csv
from google.cloud import storage 
import shutil
from PIL import Image
from math import ceil
from imgaug import augmenters as iaa
import imgaug as ia
import numpy as np

storage_client = storage.Client()


for folder_name in os.listdir('./docs-project-dragon/'):
    for sub_folder in os.listdir('./docs-project-dragon/{}/'.format(folder_name)):
        try:
            shutil.rmtree('./docs-project-dragon/{}/{}'.format(folder_name,sub_folder))
        except:
            pass


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
        sometimes(iaa.CropAndPad(
            percent=(-0.05, 0.05),
            pad_mode=ia.ALL,
            pad_cval=(0, 255)
        )),
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


def pdf_to_png(pdf_filename,version) :

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

def compute_nbr_labels(label,version):
    nbr_files = []
    for fileList in os.listdir('./docs-project-dragon/{}/img{}'.format(label,version)):
        nbr_files.append(fileList)
    return nbr_files

def augment_dataset(label, tot_aug_img,version):

    nbr_files = compute_nbr_labels(label,2)

    for i in range(0,len(nbr_files)):
        # Setting default 1000 images per class
        if (tot_aug_img-len(nbr_files)) > 0:
            # Augmenting by the factor that is dependent on nbr images
            # already present
            for augment_idx in range(0,int(ceil((tot_aug_img-len(nbr_files))/len(nbr_files)))):
                try:
                    #print (nbr_files[i])
                    image = np.array(Image.open('./docs-project-dragon/{}/img{}/{}'.format(label,version,nbr_files[i])))
                    # If image is grayscale, resize to 3 channel np array
                    if len(image.shape) ==2:
                        image = np.resize(image, (image.shape[0], image.shape[1], 3))
                    
                    # data aug methods requires 3D arrays
                    result = Image.fromarray(seq.augment_image(image).astype('uint8'),'RGB')
                    #print('augmented_img_created')
                    result.save("./docs-project-dragon/{}/img{}/aug{}_{}".format(label,version,augment_idx,nbr_files[i]))
                except Exception as e:
                    print (e)

def append_to_csv(pdf_filename,version):
    pdf_title = os.path.basename(pdf_filename)
    pdf_wtout_ext, pdf_ext = os.path.splitext(pdf_title)

    gcs_path = 'gs://project-dragon-2019-vcm/images_v2/{}.png'.format(pdf_wtout_ext)

    if os.path.isfile('./dragon-2019-v{}.csv'.format(version)) != True:
        with open('./dragon-2019-v{}.csv'.format(version),mode='w') as newFile:
            newFile_writer = csv.writer(newFile, delimiter=',')
            newFile_writer.writerow(['image','label'])
            newFile_writer.writerow([gcs_path, folder_name])
    else:
    	with open('dragon-2019-v{}.csv'.format(version), mode='a') as existFile:
    	    existFile_writer = csv.writer(existFile, delimiter=',')
	    existFile_writer.writerow([gcs_path, folder_name])

def upload_img(pdf_filename, bucket_name,version):
    """Upload CSV file."""
    
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

for folder_name in os.listdir('./docs-project-dragon/'):
    #print folder_name
    for path, subdirs, files in os.walk("./docs-project-dragon/{}".format(folder_name)):
        for name in files:
            print (name)
            pdf_filename = str(os.path.join(path, name))
            pdf_to_png(pdf_filename,2)

#print ('================================')
#print ('pdf to png is DONE')
#print ('================================')


for folder_name in os.listdir('./docs-project-dragon'):
    print ('Augmenting this folder: ' + folder_name)
    augment_dataset(folder_name,1000,2)
    print (folder_name + 'Augmentation: DONE')
    for path, subdirs, files in os.walk("./docs-project-dragon/{}".format(folder_name)):
	for name in files:
	    pdf_filename = str(os.path.join(path, name))
	    #print ('Appending to csv:')
	    append_to_csv(pdf_filename,2)
	    #print ('Uploading to GCS')
	    upload_img(pdf_filename,'project-dragon-2019-vcm',2)

