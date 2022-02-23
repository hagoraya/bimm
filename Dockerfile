#Specify a base image
FROM node:alpine

#Specify a working directory
WORKDIR /usr/app

#Copy the dependencies file
COPY ./package*.json ./

#Install dependencies
RUN npm install 

#Copy remaining files
COPY ./ ./

#TS build command
RUN npm run build

WORKDIR ./dist

RUN node app.js

