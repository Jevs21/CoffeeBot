#This is a dockerfile for running coffee bot inside of GitLab Runner
MAINTAINER mattfalkner
FROM ubuntu:latest
USER root
RUN apt-get update
RUN apt-get -y install curl gnupg
RUN curl -sL https://deb.nodesource.com/setup_11.x  | bash - 
RUN apt-get install -yq nodejs build-essential

#Ensure that sqlite3 is pre-installed in image for npm run setup
RUN apt-get -y install sqlite3

#Insure the newest version of npm is installed
RUN npm install npm -g 


#Expose the port of the server
EXPOSE 3000

