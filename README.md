### dashboard-creator-server

#### [Tokenguard](https://tokenguard.io) Dashboard Builder - Server

Welcome to the [Tokenguard](https://app.tokenguard.io) Dashboard Builder Server repository! This repository contains the backend implementation of our dashboard builder tool for data analytics. The server-side application provides APIs for connecting frontend visualizations with underlying data, saving and modifying visualization-related data, and managing user dashboards. This tool is under constant development and its initial version was delivered thanks to Web3 Foundation [grant](https://grants.web3.foundation/applications/Tokenguard)  
This repository is part of the whole project with its corresponding frontend service available at [dashboard-creator-client](https://github.com/tokenguardio/dashboard-creator-client/tree/v2.0.3)

### Features

- **API Reading Mechanism**: Connect frontend visualizations with underlying data through a RESTful API built with NodeJS and Express.
- **Data Storage**: Store visualization and dashboard-related data in MongoDB for efficient retrieval and management.
- **Scalability**: Built with scalability in mind to handle large datasets and user traffic effectively.

For detailed description of features, please refer guide in [TESTING](https://github.com/tokenguardio/dashboard-creator-server/tree/v2.0.4/TESTING) section.

### Getting Started

To get started with the dashboard builder server, follow these steps:

1. **Clone the Repository**: `git clone https://github.com/tokenguardio/dashboard-creator-server.git`
2. **go to repo root directory**: `cd dashboard-creator-server`
3. **switch to latest creator release**: `git checkout tags/v2.0.4 -b branch-v2.0.4`
4. **Install Dependencies**: `npm install`
5. **prepare environemnt variables**: cp .env.example .env
6. **set environment variables**
7. **Run the Development Server**: `npm run server:dev`
8. **see the results**: go to http://localhost:<PORT>/api-docs to see the swagger documentation endpoints

**NOTE**: On its own, the backend service will report errors because it cannot connect to database rest api service. For information about rolling out fully functional testing/demo environment, please see [TESTING](https://github.com/tokenguardio/dashboard-creator-server/tree/v2.0.4/TESTING) section.

### Getting Started with Docker

The repository comes with two Dockerfiles, the _production ready_ nginx version [here](https://github.com/tokenguardio/dashboard-creator-server/blob/v2.0.0/Dockerfile) and development environment version with auto-reload enabled [here](https://github.com/tokenguardio/dashboard-creator-server/blob/v2.0.0/Dev.Dockerfile)

In order to build and run development image:

1. **Clone the Repository**: `git clone https://github.com/tokenguardio/dashboard-creator-server.git`
2. **go to repo root directory**: `cd dashboard-creator-server`
3. **switch to latest creator release**: `git checkout tags/v2.0.4 -b branch-v2.0.4`
4. **build image**: `docker build -f Dev.Dockerfile -t dashboard-creator-server-dev .`
5. **prepare environemnt variables**: cp .env.example .env
6. **set environment variables**
7. **run image**: `docker run -p 8081:8081 --env-file .env dashboard-creator-server-dev`
8. **see the results**: go to http://localhost:8081/api-docs to see the swagger documentation endpoints

**NOTE**: On its own, the backend service will report errors because it cannot connect to database rest api service. For information about rolling out fully functional testing/demo environment, please see [TESTING](https://github.com/tokenguardio/dashboard-creator-server/tree/v2.0.4/TESTING) section.

### Running Unit Tests

1. **set env**: `export NODE_ENV=development`
2. **Run tests**: `npm test`
   tests outcome:

```
Test Suites: 7 passed, 7 total
Tests:       35 passed, 35 total
Snapshots:   0 total
Time:        17.633 s
```

### Integration tests

To see full application with all its features visit [demo app](https://demo-dc-app.tokenguard.io/). To roll out your own demo app with all its features, please follow instructions in [TESTING](https://github.com/tokenguardio/dashboard-creator-server/tree/v2.0.4/TESTING) section.

### Tech Stack

- **Backend Framework**: NodeJS with Express
- **Database**: MongoDB
- **API Documentation**: OpenAPI
- **Development Tool**: Docker

### Contributing

We encourage contributions from the community! If you'd like to contribute to the Tokenguard Dashboard Builder Server, please refer to our [contribution guidelines](CONTRIBUTING.md) for more information.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
