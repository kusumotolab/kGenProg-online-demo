FROM openjdk:11

WORKDIR /tmp/kdemo

#RUN add-apt-repository ppa:openjdk-r/ppa

#RUN apt-get update
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get install -y nodejs

COPY . .
RUN npm install

RUN wget https://github.com/kusumotolab/kGenProg/releases/download/nightly-build/kGenProg-nightly-build.jar -O bin/kgp.jar

EXPOSE 3000
CMD [ "npm", "start" ]

#CMD ["ls", "bin"]
#CMD ["java", "--version"]

# git
# mpm
# java
