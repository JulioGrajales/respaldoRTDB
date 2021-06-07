FROM node:14-alpine3.13

WORKDIR /srv/app

#COPY package.json .
#COPY package-lock.json .

#RUN npm install

COPY . .

CMD [ "node", "server.js" ]