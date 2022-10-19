const winston = require("winston");
require("express-async-errors");
const MongoDB = require("winston-mongodb");
const config = require("config");
module.exports = function () {
  winston.add(new winston.transports.File({ filename: "logFile.log" }));
  const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),

    transports: [
      new winston.transports.Console(),
      new winston.transports.MongoDB({
        db: config.get("mongodb"),
        options: { useUnifiedTopology: true },
      }),
    ],
  });

  // logger.info("  It's Work!");
  // winston.configure({
  //   transports: [
  //     new winston.transports.File({ filename: "logFile.log" }),
  //     new winston.transports.Console(),
  //     new winston.transports.MongoDB({
  //       db: config.get("mongodb"),
  //       options: { useUnifiedTopology: true },
  //     }),
  //   ],
  // });

  process.on("uncaughtException", () => {
    winston.error("We have got an uncaught Exception!");
    setTimeout(() => {
      process.exit(1);
    }, 2000);
  });

  process.on("unhandledRejection", () => {
    winston.error("We have got an unhandled Exception!");
    setTimeout(() => {
      process.exit(1);
    }, 2000);
  });
};
