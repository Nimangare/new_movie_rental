const Jwt = require("jsonwebtoken");
const config = require("config");
module.exports = (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token) return res.status(401).send("Access Denied");

  try {
    const decoded = Jwt.verify(token, config.get("jwtPrivateToken"));

    req.user = decoded;

    next();
  } catch (err) {
    console.log(err.message);
    return res.status(400).send("Invalid Token");
  }
};
