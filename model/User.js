const { model, Schema } = require("mongoose");
const Joi = require("joi");
const config = require("config");
const Jwt = require("jsonwebtoken");
const userSchema = new Schema({
  name: {
    type: String,
    minLength: 5,
    maxLength: 50,
    required: true,
  },
  email: {
    type: String,
    minLength: 5,
    maxLength: 255,
    required: true,
  },
  password: {
    type: String,
    minLength: 5,
    maxLength: 1024,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

userSchema.methods.getAuthToken = function () {
  // console.log(this);
  const user = this;
  const token = Jwt.sign(
    { _id: user._id, isAdmin: user.isAdmin },
    config.get("jwtPrivateToken")
  );
  return token;
};
const User = new model("User", userSchema);

const validateUser = async (user) => {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(1024).required(),
    isAdmin: Joi.boolean().default(false),
  });
  return schema.validate(user);
};

module.exports.User = User;
module.exports.validateUser = validateUser;
