# Description

A robust, scalable, and well-tested RESTful API for managing a Docked Bike Sharing System. Built with Node.js, Express.js, and Sequelize ORM, this API provides all the necessary endpoints for users to rent, return and manage bikes docked at designated docking stations.

## Pre-requisites

- Node.js (18 or superior)
- npm (comes with Node.js)
- PostgreSQL (17 or superior [can be replaced by other relational databases])

## Installation

```bash
$ git clone https://github.com./denis-albertini/docked-bike-sharing-system-api.git
$ cd docked-bike-sharing-system-api
$ npm i
```

## Project setup

Create a .env file and write the following variables:

```ini
POSTGRES_CONNECTION_URI=your_connection_url
# can be generated with openssl rand
JWT_SECRET=your_secret_key
SMTP_HOST=smtp_server_hostname
SMTP_USER=email_address
# might differ from the actual email password
SMTP_PASS=password_for_smtp_auth

# optional variables
SMTP_PORT=smtp_server_port
DOMAIN=your_app_domain
```

## Usefull scripts

```bash
# start the server
# will create the database schema
$ npm start

# watch mode(for development)
$ npm run dev

# tests
$ npm test
```

## Documentation

The documentation is live served at `/api/spec`. Moreover it can be found at `swagger-output.json`.

## Replacing the database

To replace the database you have to **write a new environment variable with the desired connection url** and update the `src/sequelize/sequelize.js` file by changing the first parameter of the `new Sequelize` object.
