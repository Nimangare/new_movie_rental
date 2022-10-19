const { connect } = require("mongoose");
const config = require("config");

const main = async () => {
  // if (await connect(config.get("mongodb"))) {
  //   console.log(`connected to ${config.get("mongodb")}`);
  // }
  console.log(config.get("mongodb"));
  connect(config.get("mongodb"))
    .then(() => {
      console.log(`connected to ${config.get("mongodb")}`);
    })
    .catch(() => {
      console.log("db no connected...");
    });
};

module.exports = main;
