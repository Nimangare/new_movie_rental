const express = require("express");

const genreRoute = require("../routes/genre");
const customerRoute = require("../routes/customer");
const movieRoute = require("../routes/movie");
const rentalRoute = require("../routes/rental");
const userRoute = require("../routes/user");
const error = require("../middleware/error");

module.exports = function (app) {
  app.use(express.json());
  app.use(genreRoute);
  app.use(customerRoute);
  app.use(movieRoute);
  app.use(rentalRoute);
  app.use(userRoute);
  app.use(error);
};
