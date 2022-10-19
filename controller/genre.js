const { tryWithPath } = require("@hapi/joi/lib/common");
const { get } = require("mongoose");
const { validateGenre, Genre } = require("../model/Genre");
const router = require("../routes/genre");

module.exports = {
  getAllGenres: async (req, res, next) => {
    try {
      const genres = await Genre.find();

      if (genres && genres.length === 0) {
        res.status(404).send("Genre is Not Found");
      }
      res.status(200).send(genres);
    } catch (err) {
      res.status(400).send(err.message);
    }
  },
  getOnegenre: async (req, res) => {
    try {
      const genre = await Genre.findById(req.params.id);

      if (!genre) {
        return res.status(404).send("Id is Not Found");
      }
      res.status(200).send(genre);
    } catch (err) {
      res.status(400).send(err);
    }
  },
  createGenre: async (req, res) => {
    try {
      const { error } = validateGenre(req.body);
      if (error) {
        return res.status(400).send(error.details[0].message);
      }
      const genre = new Genre(req.body);

      await genre.save();
      res.status(200).send(genre);
    } catch (err) {
      res.status(400).send(err);
    }
  },
  updateGenre: async (req, res) => {
    try {
      const genre = await Genre.findById(req.params.id);

      if (!genre) {
        return res.status(404).send("Id is Not Found...");
      }
      const result = await Genre.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            name: req.body.name || genre.name,
          },
        },
        { new: true, runValidators: true }
      );

      res.status(200).send(result);
    } catch (err) {
      res.status(400).send(err.message);
    }
  },
  deleteGenre: async (req, res) => {
    try {
      const genre = await Genre.findByIdAndDelete(req.params.id);
      if (!genre) {
        return res.status(404).send("Given genre Id is Not Found...");
      }
      res.status(200).send(genre);
    } catch (err) {
      res.status(400).send(err);
    }
  },

  
};
