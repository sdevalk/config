FROM node:9.3.0

WORKDIR /usr/src/app

COPY package.json /usr/src/app
RUN npm install --silent --progress=false

COPY . /usr/src/app
