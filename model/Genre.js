const { Schema, model } = require("mongoose");
const Joi = require("joi");
const genreSchema = new Schema({
  name: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 50,
  },
});
const Genre = new model("Genre", genreSchema);

const validateGenre = (genre) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
  });
  // const { error } = schema.validate(genre);
  // return error;
  // console.log(schema.validate(genre));
  return schema.validate(genre);
};
module.exports.Genre = Genre;
module.exports.validateGenre = validateGenre;
module.exports.genreSchema = genreSchema;
