#!/bin/bash

git pull

sudo docker build -t kdemo .
sudo docker run -p 80:3000 kdemo
