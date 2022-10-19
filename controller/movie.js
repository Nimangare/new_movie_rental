const { Genre } = require("../model/Genre");
const { Movie, validateMovie } = require("../model/Movie");

module.exports = {
  getAllMovie: async (req, res) => {
    try {
      const movies = await Movie.find();
      if (movies && movies.length === 0) {
        res.status(404).send("Movie is Not Found");
      }
      res.status(200).send(movies);
    } catch (err) {
      res.status(400).send("Genre is Not Found");
    }
  },
  getOneMovie: async (req, res) => {
    try {
      const movie = await Movie.findById(req.params.id);
      if (!movie) {
        return res.status(404).send("Id is Not Found");
      }
      res.status(200).send(movie);
    } catch (err) {
      res.status(400).send(err.message);
    }
  },
  createMovie: async (req, res) => {
    try {
      const { error } = validateMovie(req.body);
      if (error) {
        return res.status(400).send(error.details[0].message);
      }
      const genre = await Genre.findById(req.body.genreId);
      if (!genre) {
        return res.status(404).send("Id is Not Found");
      }
      const movie = new Movie({
        title: req.body.title,
        genre: {
          _id: genre._id,
          name: genre.name,
        },
        dailyRentalRate: req.body.dailyRentalRate,
        numberInStock: req.body.numberInStock,
        liked: req.body.liked,
      });

      await movie.save();
      res.status(200).send(movie);
    } catch (err) {
      res.status(400).send(err.message);
    }
  },
  updateMovie: async (req, res) => {
    try {
      const movie = await Movie.findById(req.params.id);

      if (!movie) {
        return res.status(404).send("Id is Not Found");
      }

      const genre = req.body.genreId
        ? await Genre.findById(req.body.genreId)
        : movie.genre;

      // console.log(genre);

      const result = await Movie.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            title: req.body.title || movie.title,
            genre: {
              _id: genre._id || movie.genre._id,
              name: genre.name || movie.genre.name,
            },
            dailyRentalRate: req.body.dailyRentalRate || movie.dailyRentalRate,
            numberInStock: req.body.numberInStock || movie.numberInStock,
            liked: req.body.liked || movie.liked,
          },
        },
        { new: true, runValidators: true }
      );

      res.status(200).send(result);
    } catch (err) {
      res.status(400).send(err.message);
    }
  },
  patchLiked: async (req, res) => {
    try {
      const movie = await Movie.findById(req.params.id);

      if (!movie) {
        return res.status(404).send("Id is Not Found");
      }

      const genre = req.body.genreId
        ? await Genre.findById(req.body.genreId)
        : movie.genre;

      // console.log(genre);

      const result = await Movie.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            liked: req.body.liked,
          },
        },
        { new: true, runValidators: true }
      );

      res.status(200).send(result);
    } catch (err) {
      res.status(400).send(err.message);
    }
  },
  deleteMovie: async (req, res) => {
    try {
      const movie = await Movie.findByIdAndDelete(req.params.id);
      if (!movie) {
        return res.status(404).send("Given movie Id is Not Found...");
      }
      res.status(200).send(movie);
    } catch (err) {
      res.status(400).send(err.messagge);
    }
  },
};
