#Specify a base image
FROM node:alpine as base

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
