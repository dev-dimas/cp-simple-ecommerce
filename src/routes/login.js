const express = require("express");

const loginCtrl = require("../controllers/LoginController");
const {loginValidator} = require("../models/validators");

const app = express.Router();

app.post("/login", loginValidator, loginCtrl.getLogged);

module.exports = app;
