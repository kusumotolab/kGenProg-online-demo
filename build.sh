#!/bin/bash

git pull

sudo docker build -t kdemo .
sudo docker run -it -p 80:3000 kdemo
