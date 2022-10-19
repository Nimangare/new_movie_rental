const winston = require("winston");
module.exports = (err, req, res, next) => {
  winston.error(err.message);
  res.status(400).send("Somethig Wrong!");
};
