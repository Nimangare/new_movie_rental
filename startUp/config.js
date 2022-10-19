const config = require("config");
module.exports = function () {
  if (!config.get("jwtPrivateToken")) {
    process.exit(1);
  }
};
