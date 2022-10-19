const { validateRental } = require("../model/Rental");
const { Rental } = require("../model/Rental");
const { Movie } = require("../model/Movie");
const { Customer } = require("../model/Customer");
module.exports = {
  getAllRentals: async (req, res, next) => {
    try {
      const rentals = await Rental.find();

      if (rentals && rentals.length === 0) {
        return res.status(404).send("rentals is Empty");
      }
      res.status(200).send(rentals);
    } catch (err) {
      res.status(400).send(err);
    }
  },

  getOneRentals: async (req, res, next) => {
    try {
      const rental = await Rental.findById(req.params.id);

      if (!rental) return res.status(404).send("Id is Not Found...");

      res.status(200).send(rental);
    } catch (err) {
      res.status(400).send(err.message);
    }
  },

  createRental: async (req, res, next) => {
    try {
      const { error } = validateRental(req.body);
      if (error) {
        return res.status(400).send(error.details[0].message);
      }

      const customerObj = await Customer.findById(req.body.customerId);

      if (!customerObj) {
        return res.status(404).send("customer is Not Found");
      }

      const movieObj = await Movie.findById(req.body.movieId);

      if (movieObj.numberInStock <= 0) {
        return res.status(404).send("Movie is out of Stock");
      }

      const rental = new Rental({
        customer: {
          name: customerObj.name,
          phone: customerObj.phone,
        },
        movie: movieObj,
        rentalFee: movieObj.dailyRentalRate * 10,
        dateOut: Date.now(),
        dateIn: null,
      });
      const session = await Rental.startSession();
      session.startTransaction();
      try {
        await rental.save();
        // movieObj.numberInStock -= 1;
        await Movie.findByIdAndUpdate(req.body.movieId, {
          $inc: {
            numberInStock: -1,
          },
        });
        await movieObj.save();
      } catch (err) {
        session.abortTransaction();
        throw res.status(401).send(err.message);
      }
      session.commitTransaction();
      session.endSession();
      res.status(200).send(rental);
    } catch (err) {
      res.status(401).send(err.message);
    }
  },

  updateRental: async (req, res, next) => {
    try {
      let obj = await Rental.findById(req.params.id);
      if (!obj) return res.status(404).send("Id is Not Found...");

      const session = await Rental.startSession();
      session.startTransaction();

      const rental = await Rental.findByIdAndUpdate(
        req.params.id,
        {
          dateIn: Date.now(),
        },
        {
          new: true,
        }
      );
      try {
        await obj.save();
        await Movie.findByIdAndUpdate(obj.movie, {
          $inc: {
            numberInStock: +1,
          },
        });
      } catch (err) {
        throw res.status(401).send(err.message);
      }
      session.commitTransaction();
      session.endSession();

      res.status(200).send(rental);
    } catch (err) {
      res.status(400).send(err.message);
    }
  },

  deleteRental: async (req, res, next) => {
    try {
      const rental = await Rental.findById(req.params.id);

      if (!rental) return res.status(404).send("Id is Not Found...");

      const session = await Rental.startSession();
      session.startTransaction();
      try {
        await Rental.findByIdAndDelete(req.params.id);
        await Movie.findByIdAndUpdate(rental.movie, {
          $inc: {
            numberInStock: +1,
          },
        });
      } catch (err) {
        throw res.status(400).send(err.message);
      }
      res.status(200).send(rental);
    } catch (err) {
      res.status(400).send(err.message);
    }
  },
};
