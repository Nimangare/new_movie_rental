const { User, validateUser } = require("../model/User");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const Joi = require("joi");

const validateEmail_Password = async (data) => {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(1024).required(),
  });
  return schema.validate(data);
};

module.exports = {
  getAllUsers: async (req, res) => {
    try {
      const user = await User.find();
      if (!user) {
        return res.status(404).send("Customer is Not Found");
      }
      res.status(200).send(user);
    } catch (err) {
      res.status(400).send(err);
    }
  },

  getOneUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).send("Customer is Not Found");
      }
      res.status(200).send(user);
    } catch (err) {
      return res.status(400).send(err);
    }
  },

  createUser: async (req, res) => {
    try {
      const { error } = validateUser(req.body);
      if (error) {
        return res.status(400).send(error.details[0].message);
      }

      const user = await User.findOne({ email: req.body.email });
      if (user) return res.status(301).send("User already exist");

      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(req.body.password, salt);

      const userObj = new User(req.body);

      userObj.password = hashPassword;
      await userObj.save();
      res
        .status(200)
        .send(_.pick(userObj, ["_id", "name", "email", "isAdmin"]));
    } catch (err) {
      res.status(400).send(err.message);
    }
  },

  loginUser: async (req, res) => {
    try {
      const { error } = validateEmail_Password(req.body);
      if (error) {
        return res.status(400).send(error.details[0].message);
      }

      const user = await User.findOne({ email: req.body.email });
      if (!user) return res.status(301).send("User is not exist");

      const isValid = await bcrypt.compare(req.body.password, user.password);

      if (!isValid) res.status(401).send("User is Invalid");
      const token = user.getAuthToken();
      res.status(200).send(token);
    } catch (err) {
      res.status(400).send(err.message);
    }
  },

  updateUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).send("Customer is Not Found");
      }
      const result = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            name: req.body.name || user.name,
            email: req.body.email || user.email,
            password: req.body.password || user.password,
            isAdmin: req.body.isAdmin || user.isAdmin,
          },
        },
        { new: true, runValidators: true }
      );
      res.status(200).send(result);
    } catch (err) {
      res.status(400).send(err.message);
    }

    //   async (req, res) => {
    //     try {
    //       const user = await User.findById(req.params.id);
    //       if (!user) {
    //         return res.status(404).send("Customer is Not Found");
    //       }
    //       const result = await User.findByIdAndUpdate(
    //         req.params.id,
    //         {
    //           $set: {
    //             name: req.body.name || user.name,
    //             email: req.body.email || user.email,
    //             password: req.body.password || user.password,
    //             isAdmin: req.body.isAdmin || user.isAdmin,
    //           },
    //         },
    //         { new: true, runValidators: true }
    //       );
    //       res.status(200).send(result);
    //     } catch (err) {
    //       res.status(400).send(err.message);
    //     }
    //   };
  },

  deleteUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).send("Customer is Not Found");
      }

      const result = await User.findByIdAndDelete(req.params.id);

      res.status(200).send(result);
    } catch (err) {
      res.status(401).send(err);
    }
  },
};
