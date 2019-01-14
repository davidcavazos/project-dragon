# User and Project variables
USERS=("aketari" "dcavazos")
# USER=$(gcloud config list --format="value(core.account)" | cut -d '@' -f1)
PROJECT_ID=$(gcloud config list --format 'value(core.project)')
PROJECT_NETWORK="default"
PROJECT_STAGE="dev" # set to empty if STAGED_GSID contains env

# compute config
COMPUTE_REGION="us-west1"
COMPUTE_ZONE="ud-west1-c"

# storage config
STORAGE_REGION="us-west1"

# App Model VM variables

APP_MODEL_VM_INSTANCE_NAME="app-model-vm"
APP_MODEL_VM_MACHINE_TYPE="n1-highmem-4"
APP_MODEL_VM_IMAGE_FAMILY="tf-1-11-cu100"
APP_MODEL_VM_IMAGE_PROJECT="deeplearning-platform-release"
APP_MODEL_VM_MAINTENANCE_POLICY="TERMINATE"
APP_MODEL_VM_ACCELERATOR="type=nvidia-tesla-p100,count=1"
APP_MODEL_VM_BOOT_DISK_SIZE=400GB
APP_MODEL_METADATA="install-nvidia-driver=True"
APP_MODEL_VM_SCOPES="storage-rw"
APP_MODEL_VM_CUSTOM_TAG="seismic-app-model-vm"
APP_MODEL_VM_TAGS="$APP_MODEL_VM_CUSTOM_TAG,http-server,https-server"


# Cloud Storage variables


