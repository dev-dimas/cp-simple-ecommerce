# Capstone Project Simple E-Commerce

This repository showcases the culmination of a capstone project that was developed as part of the task completion for the MSIB Productzilla program.

## Features

- 🚀 Express — A fast and minimalist web framework for building backend applications.
- 🍃 MongoDB — Document-oriented database system known for its flexibility and scalability.
- 🔒 Bcrypt — A library for securely hashing and verifying passwords.
- 🎫 JWT — JSON Web Token is used for authenticating and authorizing users.
- 📚 Swagger — An interactive and structured API documentation tool.
- 🔍 Express Validator — Middleware library used for data validation in Express.js applications.
- 💖 Prettier — Code Formatter for consistent style
- ⚙️ EditorConfig — Maintain consistent coding styles across editors and IDEs

## Quick Start

To get started with this project, follow the steps below :

1. Clone the repository :

```
git clone https://github.com/dev-dimas/cp-simple-ecommerce
```

2. Change into the project directory :

```
cd <project-directory>
```

3. Install the dependencies :

```
npm install
```

4. Configure the necessary environment variables. You may find a sample configuration file `.env.example` in the project root directory. Rename it to `.env` and update the values with your own configuration.

5. Start the development server :

```
npm run dev
```

Dont forget to install nodemon.

6. Open your web browser and navigate to `http://localhost:3000` to see the application running.

## Directory Structure

- [`src`](./src) — Main source directory that holds the core code files of this application.
- [`controllers`](./src/controllers) — Contains the controller files responsible for handling the business logic.
- [`database`](./src/database) — Used for handling database connection and configuration, specifically for MongoDB.
- [`docs`](./src/docs) — Contains the necessary files to describe and document the API endpoints, request/response schemas, and any additional information related to the API.
- [`domain`](./src/domain) — Contains core business logic of an application.
- [`middlewares`](./src/middlewares) — Contains the middleware functions used in this application.
- [`models`](./src/models) — Contains the database models, typically defined using Mongoose schemas.
- [`routes`](./src/routes) — Defines the API routes and their corresponding handlers.
- [`utils`](./src/utils) — Contains utility functions or modules that provide common and reusable functionality across the project.
- [`tests`](./tests) — Used to store test files and test-related resources for automated testing purposes.
