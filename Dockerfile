FROM node:11

COPY package*.json ./

RUN npm i

COPY . /.

EXPOSE 3000:3000

ENTRYPOINT node index.js
