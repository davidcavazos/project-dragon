FROM ubuntu:18.04

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update 
RUN apt-get install -y --no-install-recommends apt-utils

RUN \
    apt-get install -y build-essential && \
    apt-get install -y software-properties-common && \
    apt-get install -y byobu curl git htop man unzip vim wget && \
    apt-get install -y libjpeg-dev && \
    apt-get install -y ghostscript && \
    apt-get install -y libtiff5-dev && \
    apt-get install -y libfreetype6 && \
    apt-get install -y libfreetype6-dev && \
    apt-get install -y imagemagick poppler-utils

RUN curl -sL https://deb.nodesource.com/setup_10.x -o nodesource_setup.sh 
RUN bash nodesource_setup.sh
RUN apt-get install -y nodejs

RUN apt-get install -y git

RUN wget ftp://ftp.graphicsmagick.org/pub/GraphicsMagick/1.3/GraphicsMagick-1.3.26.tar.gz
RUN tar xzvf GraphicsMagick-1.3.26.tar.gz

WORKDIR GraphicsMagick-1.3.26

RUN ./configure
RUN make
RUN make install

WORKDIR "../src/webapp"

COPY . ./converter-job

WORKDIR "converter-job"

RUN npm install

ENTRYPOINT ["node","pdf-to-image.js"]