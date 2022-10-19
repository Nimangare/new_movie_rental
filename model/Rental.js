const { Schema, model, default: mongoose } = require("mongoose");
const { Customer } = require("../model/Customer");
const { Movie, movieSchema } = require("../model/Movie");
const rentalSchema = new Schema({
  //   customer: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "Customer",
  //   },
  // customer: {
  //     type: new Schema({
  //         name: String,
  //         phone:String
  //     })
  // }
  customer: {
    type: {
      name: String,
      phone: String,
    },
  },
  movie: {
    type: movieSchema,
    required: true,
  },

  //   movie: {
  //     type: {
  //       title: {
  //         type: String,
  //         required: true,
  //         minLength: 5,
  //         maxLength: 50,
  //       },
  //       genre: {
  //         type: genreSchema,
  //         required: true,
  //       },
  //       dailyRentalRate: {
  //         type: Number,
  //         required: true,
  //         min: 0,
  //         max: 10,
  //       },
  //       numberInStock: {
  //         type: Number,
  //         require: true,
  //         min: 0,
  //         max: 50,
  //       },
  //       liked: {
  //         type: Boolean,
  //         default: false,
  //       },
  //     },
  //   },

  rentalFee: {
    type: Number,
    required: true,
    min: 0,
  },
  dateOut: {
    type: Date,
    default: Date.now,
  },
  dateIn: {
    type: String,
    default: null,
  },
});

module.exports.Rental = model("Rental", rentalSchema);

// const Joi = require("joi");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
// const { date } = require("joi");
const validateRental = (rental) => {
  const schema = Joi.object({
    customerId: Joi.objectId(),
    movieId: Joi.objectId(),
  });
  return schema.validate(rental);
};

module.exports.validateRental = validateRental;
