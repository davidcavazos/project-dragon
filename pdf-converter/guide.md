
# Prepare for installing

    PROMPT> sudo apt update
    PROMPT> sudo apt-get install build-essential

    PROMPT> sudo apt-get install libpng12-0
    PROMPT> sudo apt-get install libjpeg-dev
    PROMPT> sudo apt-get install ghostscript
    PROMPT> sudo apt-get install libtiff5-dev
    PROMPT> sudo apt-get install libfreetype6
    PROMPT> sudo apt-get install libfreetype6-dev
    PROMPT> sudo apt-get install imagemagick poppler-utils

# Installing Nod JS and GIT

    PROMPT> curl -sL https://deb.nodesource.com/setup_10.x -o nodesource_setup.sh
    PROMPT> sudo bash nodesource_setup.sh
    PROMPT> sudo apt install nodejs
    PROMPT> sudo apt-get install git


I use GM to convert PDF to png and jpg images.

# Download GraphicsMagick's source code (9 MB). This takes about 10 minutes

    PROMPT> wget ftp://ftp.graphicsmagick.org/pub/GraphicsMagick/1.3/GraphicsMagick-1.3.26.tar.gz

# Unzip and configure GraphicsMagick

    PROMPT> tar xzvf GraphicsMagick-1.3.26.tar.gz
    PROMPT> cd GraphicsMagick-1.3.26
    PROMPT> ./configure

# Check that the result of configure looks like this

It must have png and jpg support, otherwise GraphicsMagick won't be to much help making thumbnails.

    GraphicsMagick is configured as follows. Please verify that this
    configuration matches your expectations.
    
    Host system type : x86_64-unknown-linux-gnu
    Build system type : x86_64-unknown-linux-gnu
    
    Option            Configure option           	Configured value
    -----------------------------------------------------------------
    Shared libraries  --enable-shared=no    	no
    Static libraries  --enable-static=yes    	yes
    GNU ld            --with-gnu-ld=yes        	yes
    Quantum depth     --with-quantum-depth=8 	8
    Modules           --with-modules=no        	no
    
    Delegate Configuration:
    BZLIB             --with-bzlib=yes          	no
    DPS               --with-dps=yes              	no
    FlashPIX          --with-fpx=no              	no
    FreeType 2.0      --with-ttf=yes          	yes
    Ghostscript       None                   	gs (9.18)
    Ghostscript fonts --with-gs-font-dir=default    /usr/share/fonts/type1/gsfonts/
    Ghostscript lib   --with-gslib=no       	no
    JBIG              --with-jbig=yes        	yes
    JPEG v1           --with-jpeg=yes        	yes
    JPEG-2000         --with-jp2=yes          	no
    LCMS v2           --with-lcms2=yes        	no
    LZMA              --with-lzma=yes        	yes
    Magick++          --with-magick-plus-plus=yes 	yes
    PERL              --with-perl=no            	no
    PNG               --with-png=yes          	yes (-lpng12)
    TIFF              --with-tiff=yes        	yes
    TRIO              --with-trio=yes        	no
    WEBP              --with-webp=yes        	no
    Windows fonts     --with-windows-font-dir=	none
    WMF               --with-wmf=yes          	no
    X11               --with-x=             	no
    XML               --with-xml=yes          	yes
    ZLIB              --with-zlib=yes        	yes
    
    X11 Configuration:
    
      Not using X11.
    
    Options used to compile and link:
      CC       = gcc
      CFLAGS   = -fopenmp -g -O2 -Wall -pthread
      CPPFLAGS = -I/usr/include/freetype2 -I/usr/include/libxml2
      CXX      = g++
      CXXFLAGS = -pthread
      DEFS     = -DHAVE_CONFIG_H
      LDFLAGS  = 
      LIBS     = -ljbig -ltiff -lfreetype -ljpeg -lpng12 -llzma -lxml2 -lz -lm -lgomp -lpthread


# Compile GraphicsMagick

    PROMPT> make
    PROMPT> sudo make install


# Check GraphicsMagick version

    PROMPT> gm version
    GraphicsMagick 1.3.26 2017-07-04 Q8 http://www.GraphicsMagick.org/
    Copyright (C) 2002-2017 GraphicsMagick Group.


# Obtain path to gm

    PROMPT> which gm
    /usr/local/bin/gm