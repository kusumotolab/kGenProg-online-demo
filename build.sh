#!/bin/bash

# enable DCT
export DOCKER_CONTENT_TRUST=1

sudo docker build -t kdemo-image .

sudo docker run \
     -p 3000:3000             `# expose local 3000` \
     -d                       `# run as detach mode to be background` \
     --log-driver=json-file   `# keep logs` \
     --log-opt max-size=10m   `# keep logs` \
     --log-opt max-file=100   `# keep logs` \
     --restart unless-stopped `# restart always` \
     --name kdemo             \
     kdemo-image              \

#    --rm                     `# immediately remove container when stopped` \
