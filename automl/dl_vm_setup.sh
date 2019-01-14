# import config variables
source ../config.sh

# if firewall rule does not exist, if not create one
if (! gcloud compute firewall-rules list --format=json| grep -q "\"name\": \"$FIREWALL_RULE\""); then 
        gcloud compute firewall-rules create $FIREWALL_RULE --allow=tcp:8888,tcp:6006 --target-tags=$VM_TAG
fi

# create static IP address and store the IP address in variable
gcloud compute addresses create $INSTANCE_NAME"-static-ip" --region $PROJECT_REGION
VM_IP_ADDRESS=$(gcloud compute addresses describe $INSTANCE_NAME"-static-ip" --region $PROJECT_REGION --format="value(address)")

# create deep learning vm
#TODO: move this to terraform where user in INSTANCE_NAME is taken from an array (if all developers share common project)
gcloud compute instances create $INSTANCE_NAME \
        --zone=$PROJECT_ZONE \
        --image-family=$IMAGE_FAMILY \
        --image-project=deeplearning-platform-release \
        --maintenance-policy=TERMINATE \
        --accelerator="type=nvidia-tesla-p100,count=1" \
        --machine-type=$INSTANCE_TYPE \
        --boot-disk-size=40GB \
        --metadata="install-nvidia-driver=True" \
        --address=$VM_IP_ADDRESS \
        --tags=http-server,$VM_TAG