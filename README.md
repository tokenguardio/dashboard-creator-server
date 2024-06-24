### dashboard-creator-server

#### [Tokenguard](https://tokenguard.io) Dashboard Builder - Server

Welcome to the [Tokenguard](https://app.tokenguard.io) Dashboard Builder Server repository! This repository contains the backend implementation of our dashboard builder tool for data analytics. The server-side application provides APIs for connecting frontend visualizations with underlying data, saving and modifying visualization-related data, and managing user dashboards. This tool is under constant development and its initial version was delivered thanks to Web3 Foundation [grant](https://grants.web3.foundation/applications/Tokenguard)  
This repository is part of the whole project with its corresponding frontend service available at [dashboard-creator-client](https://github.com/tokenguardio/dashboard-creator-client/tree/v2.0.3)

### Features

- **API Reading Mechanism**: Connect frontend visualizations with underlying data through a RESTful API built with NodeJS and Express.
- **Data Storage**: Store visualization and dashboard-related data in MongoDB for efficient retrieval and management.
- **Scalability**: Built with scalability in mind to handle large datasets and user traffic effectively.

For detailed description of features, please refer guide in [TESTING](https://github.com/tokenguardio/dashboard-creator-server/tree/v2.0.6/TESTING) section.

### Getting Started

Dashboard Creator Server is only one part of more complex project including following services:

1. [dashboard-creator-server](https://github.com/tokenguardio/dashboard-creator-server/tree/v2.0.6) - the backend service storing information about build dashboards and queries
2. [dashboard-creator-client](https://github.com/tokenguardio/dashboard-creator-client/tree/v2.0.3) - frontend app
3. [db-api](https://hub.docker.com/r/patternsjrojek/db-api) - REST interface between PostgreSQL database and backend service. [Tokenguard.io](https://tokenguard.io) has its private implementation of such service and its image is available in dockerhub, however everyone is encouraged to create his own db-api and connect it to provided dashboard builder backend and frontend.

To fully function backend service needs mongodb to store dashboard configuration, layout and displayed dashboard elements. Implementation of [Tokenguard.io](https://tokenguard.io) db-api consists of two PostgreSQL databases. One for storing queries (QUERIES*DB*_ env variables) and the other one with actual data for metrics visualization (DATA*DB*_ env variables)

For convenience and ease of further project development, we provide minimal [docker-compose](https://github.com/tokenguardio/dashboard-creator-server/tree/v2.0.6/docker-compose.yml) project to get you started. It spins up server app (this one), db-api and required underlying databases. It starts in dev mode with hot reaload.

1. **Clone the Repository**: `git clone https://github.com/tokenguardio/dashboard-creator-server.git`
2. **go to repo root directory**: `cd dashboard-creator-server`
3. **switch to latest creator release**: `git checkout tags/v2.0.6 -b branch-v2.0.6`
4. **Run the Development docker-compose environment**: `docker-compose up`
5. **see the results**: go to http://localhost:8081/api-docs to see the swagger documentation endpoints

```
git clone https://github.com/tokenguardio/dashboard-creator-server.git
cd dashboard-creator-server
git checkout tags/v2.0.6 -b branch-v2.0.6
docker-compose up
```

### Running Unit Tests

1. **install dependencies**: `npm install`
2. **Run tests**: `npm test`
   tests outcome:

```
Test Suites: 7 passed, 7 total
Tests:       35 passed, 35 total
Snapshots:   0 total
Time:        17.633 s
```

### Integration tests

To see full application with all its features visit [demo app](https://demo-dc-app.tokenguard.io/). To roll out your own demo app with all its features, please follow instructions in [TESTING](https://github.com/tokenguardio/dashboard-creator-server/tree/v2.0.6/TESTING) section.

### Tech Stack

- **Backend Framework**: NodeJS with Express
- **Database**: MongoDB, PostgreSQL
- **API Documentation**: OpenAPI
- **Development Tool**: Docker

### Contributing

We encourage contributions from the community! If you'd like to contribute to the Tokenguard Dashboard Builder Server, please refer to our [contribution guidelines](CONTRIBUTING.md) for more information.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
