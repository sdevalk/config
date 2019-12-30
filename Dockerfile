FROM node:12.0.0

WORKDIR /usr/src/app

COPY package.json .

RUN npm install

COPY . .
