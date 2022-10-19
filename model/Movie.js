const { model, Schema } = require("mongoose");
const { genreSchema } = require("../model/Genre");
const Joi = require("joi");
const { string } = require("joi");
const movieSchema = new Schema({
  title: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 50,
  },
  genre: {
    type: genreSchema,
    required: true,
  },
  dailyRentalRate: {
    type: Number,
    required: true,
    min: 0,
    max: 10,
  },
  numberInStock: {
    type: Number,
    require: true,
    min: 0,
    max: 50,
  },
  liked: {
    type: Boolean,
    default: false,
  },
});
const Movie = new model("Movie", movieSchema);

const validateMovie = (customer) => {
  const schema = Joi.object({
    title: Joi.string().min(5).max(10).required(),
    genreId: Joi.string().required(),
    dailyRentalRate: Joi.number().min(0).max(10).required(),
    numberInStock: Joi.number().min(0).max(50).required(),
    liked: Joi.boolean().default(false),
  });
  return schema.validate(customer);
};

module.exports.validateMovie = validateMovie;
module.exports.Movie = Movie;
module.exports.movieSchema = movieSchema;
