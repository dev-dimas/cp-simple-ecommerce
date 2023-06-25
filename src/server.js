const bodyParser = require("body-parser");
const {connectDB} = require("./database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const multer = require("multer");
const path = require("path");

const notFoundMiddleware = require("./middlewares/notFoundMiddleware");
const errorMiddleware = require("./middlewares/errorMiddleware");

const apiRoute = require("./routes");

const server = () => {
  const app = express();
  const upload = multer({dest: path.resolve("tmp")});
  connectDB();

  app.use(cors({origin: "*"}));
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(upload.any());

  app.use("/", apiRoute);
  app.use("/", express.static(path.resolve("public")));

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);
  return app;
};

module.exports = {server};
