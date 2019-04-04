# import config variables
source ../config.sh

# Spin up VM
setup_model_vm() {

        model_vm_instance_name=${1}
        model_vm_machine_type=${2}
        model_vm_image_family=${3}
        model_vm_image_project=${4}
        model_vm_maintenance_policy=${5}
        model_vm_accelerator=${6}
        model_vm_boot_disk=${7}
        model_vm_metadata=${8}
        scopes=${9}
        tags=${10}

        # setup app model VM if not already done and get the VM IP address
        if (! gcloud compute instances list --format="value(NAME)" | grep -wq "$model_vm_instance_name"); then

                # if external static IP doesn't exist, create one
                if (! gcloud compute addresses list --format="value(NAME)" | grep -wq  "$model_vm_instance_name-static-ip"); then
                        gcloud compute addresses create $model_vm_instance_name"-static-ip" --region $COMPUTE_REGION
                fi
                model_vm_external_ip=$(gcloud compute addresses describe $model_vm_instance_name"-static-ip" --region $COMPUTE_REGION --format="value(address)")
                
                # create deep learning vm
                #TODO: move this to terraform
                gcloud compute instances create $model_vm_instance_name \
                        --zone=$COMPUTE_ZONE \
                        --machine-type=$model_vm_machine_type \
                        --image-family=$model_vm_image_family \
                        --image-project=$model_vm_image_project \
                        --maintenance-policy=$model_vm_maintenance_policy \
                        --accelerator="$model_vm_accelerator" \
                        --boot-disk-size=$model_vm_boot_disk \
                        --metadata="$model_vm_metadata" \
                        --address=$model_vm_external_ip \
                        --scopes=$scopes \
                        --tags=$tags
        fi
}

setup_model_vm $APP_MODEL_VM_INSTANCE_NAME $APP_MODEL_VM_MACHINE_TYPE \
        $APP_MODEL_VM_IMAGE_FAMILY $APP_MODEL_VM_IMAGE_PROJECT \
        $APP_MODEL_VM_MAINTENANCE_POLICY $APP_MODEL_VM_ACCELERATOR \
        $APP_MODEL_VM_BOOT_DISK_SIZE $APP_MODEL_METADATA \
        $APP_MODEL_VM_SCOPES $APP_MODEL_VM_TAGS


