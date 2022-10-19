const express = require("express");
require("dotenv").config();
require("express-async-errors");
require("./startUp/db")();

const app = express();

require("./startUp/logging");
require("./startUp/cors")(app);
require("./startUp/config")();
require("./startUp/routes")(app);
require("./startUp/prod")(app);

if (process.env.NODE_ENV !== "test") {
  require("./startUp/port")(app);
}

app.use("/", (req, res) => {
  res.send("Nitin");
});
