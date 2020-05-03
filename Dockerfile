FROM node:12-alpine

WORKDIR /kdemo

RUN apk --no-cache add openjdk11-jre-headless wget
RUN mkdir -p /kdemo/bin \
        && wget https://github.com/kusumotolab/kGenProg/releases/download/nightly-build/kGenProg-nightly-build.jar -O /kdemo/bin/kgp.jar \
	      && apk del --purge wget
	
COPY package*.json /kdemo/
RUN npm install --only=production
COPY . /kdemo
EXPOSE 3000
CMD [ "npm", "start" ]
