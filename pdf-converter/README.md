
# Prepare for installing

    PROMPT> sudo apt update
    
# Install GIT

    PROMPT> sudo apt-get install git

# Install Docker

    PROMPT> sudo apt install docker.io
    PROMPT> docker --version

# Create image and run container

    PROMPT> sudo docker build --rm -t "pdf-converter-image" pdf-converter
    PROMPT> sudo docker run -d "pdf-converter-image"