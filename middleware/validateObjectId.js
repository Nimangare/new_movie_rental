const mongoose = require("mongoose");
module.exports = (req, res, next) => {
  const isvalid = mongoose.Types.ObjectId.isValid(req.params.id);
  // console.log(isvalid);

  if (!isvalid) {
    res.status(400).send("Invalid Id");
  }

  next();
};
