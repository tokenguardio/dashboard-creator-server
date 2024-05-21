FROM node:16

WORKDIR /app

RUN apt-get update && apt-get install -y libcurl4-openssl-dev libssl-dev
COPY package.json ./
RUN npm install
RUN npm install -g migrate-mongo

COPY . .
EXPOSE 8081
CMD [ "npm", "run", "server:dev" ]
