FROM node:12-alpine

WORKDIR /kdemo
RUN apk --no-cache add \
    openjdk11-jre-headless \
    wget

COPY . /kdemo
RUN npm install --only=production

ARG KGPVER=1.7.0
ARG KGPJAR=https://github.com/kusumotolab/kGenProg/releases/download/v${KGPVER}/kGenProg-${KGPVER}.jar
RUN mkdir -p /kdemo/bin && \
    wget ${KGPJAR} -O /kdemo/bin/kgp.jar && \
    apk del --purge wget

EXPOSE 3000
CMD [ "npm", "start" ]
