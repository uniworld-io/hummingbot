#!/bin/bash
# init

# Specify image name to build
read -p "   Enter Hummingbot image name you want to use (default = \"uniworld/hummingbot\") >>> " IMAGE_NAME
if [ "$IMAGE_NAME" == "" ]
then
  IMAGE_NAME="uniworld/hummingbot"
fi


# Specify hummingbot version
read -p "   Enter Hummingbot version you want to use [latest/development] (default = \"latest\") >>> " TAG
if [ "$TAG" == "" ]
then
  TAG="latest"
fi

docker build -t $IMAGE_NAME:$TAG -f Dockerfile .
