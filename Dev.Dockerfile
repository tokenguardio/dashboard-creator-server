# Development Dockerfile used with docker-compose 
FROM node:16

WORKDIR /app

# Install libcurl4-openssl-dev and libssl-dev to satisfy library dependencies
RUN apt-get update && apt-get install -y libcurl4-openssl-dev libssl-dev

# Copy package.json files first
COPY package.json  ./

# Install dependencies
RUN npm install

# Install migrate-mongo globally
RUN npm install -g migrate-mongo

COPY . .

# Make your script executable
RUN chmod +x /app/scripts/docker/local-run.sh

# Expose the port your application will run on
EXPOSE 8082

# Specify the command to start your application
CMD [ "npm", "start" ]
