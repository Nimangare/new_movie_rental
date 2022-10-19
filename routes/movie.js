const express = require("express");

const router = express.Router();
const movie = require("../controller/movie");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");
const { Movie } = require("../model/Movie");

router.get("/movies", movie.getAllMovie);

router.post("/movies", auth, movie.createMovie);

router.get("/movies/:id", validateObjectId, movie.getOneMovie);

router.put("/movies/:id", auth, admin, validateObjectId, movie.updateMovie);

router.patch("/movies/:id", auth, admin, validateObjectId, movie.patchLiked);

router.delete("/movies/:id", auth, admin, validateObjectId, movie.deleteMovie);

router.post("/movies/count", async (req, res) => {
  const { title, genre } = req.body;

  // console.log({ title, genre });
  let query = {};
  if (genre) {
    query["genre._id"] = genre;
  }
  // console.log(query);
  if (!title) {
    let movies = await Movie.find(query);

    return res.send(movies.length + "");
  }
  query["title"] = new RegExp(`^${title}`, "i");
  const totalNoOfMovies = await Movie.find(query).countDocuments();
  res.status(200).send(totalNoOfMovies + "");
});

router.post("/movies/pfs", async (req, res) => {
  const { pageSize, currentPage, title, genre, sortColumn } = req.body;
  const { path, order } = sortColumn;
  // console.log({ pageSize, currentPage, title, genre });
  let skip = 0;
  let limit = 0;
  let query = {};
  if (pageSize && currentPage) {
    skip = (currentPage - 1) * pageSize;
    limit = pageSize;
  }

  if (genre) {
    query["genre._id"] = genre;
  }

  if (title) {
    query["title"] = new RegExp(`^${title}`, "i");
  }

  let movies = await Movie.find(query)
    .limit(limit)
    .skip(skip)
    .sort({
      [path]: order,
    });
  // console.log({ movies });
  res.send(movies);
});

module.exports = router;
