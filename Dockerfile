FROM node:7.9.0

WORKDIR /usr/src/app

COPY package.json /usr/src/app
RUN npm install && npm cache clean

COPY . /usr/src/app
