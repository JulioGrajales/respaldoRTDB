FROM node:14-alpine3.13

WORKDIR /srv/app

COPY package*.json .

RUN npm install

COPY . .

CMD [ "npm", "run", "dev" ]