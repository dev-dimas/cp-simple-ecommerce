const express = require("express");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const path = require("path");
const YAML = require("yaml");

const swaggerDoc = fs.readFileSync(
  path.resolve("src/docs/swagger.yaml"),
  "utf-8",
);
const options = {
  customSiteTitle: "Simple E-Commerce",
  customCss: fs.readFileSync(
    path.resolve("src/docs/styles/material.css"),
    "utf-8",
  ),
  explorer: false,
  isExplorer: false,
  swaggerOptions: {defaultModelsExpandDepth: -1},
};

const usersRoute = require("./users");
const shopsRoute = require("./shops");
const cartsRoute = require("./carts");
const transactionRoute = require("./transaction");
const reviewRoute = require("./review");
const loginRoute = require("./login");

const app = express.Router();

app.use("/", swaggerUi.serve);
app.get("/", swaggerUi.setup(YAML.parse(swaggerDoc), options));
app.use("/api", usersRoute);
app.use("/api", shopsRoute);
app.use("/api", cartsRoute);
app.use("/api", transactionRoute);
app.use("/api", reviewRoute);
app.use("/api", loginRoute);

module.exports = app;
