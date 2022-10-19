const express = require("express");

const router = express.Router();
const genre = require("../controller/genre");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");
const error = require("../middleware/error");
const { Genre } = require("../model/Genre");

router.get("/genres", genre.getAllGenres);

router.post("/genres", auth, genre.createGenre);

router.get("/genres/:id", validateObjectId, genre.getOnegenre);

router.put("/genres/:id", auth, admin, validateObjectId, genre.updateGenre);

router.delete("/genres/:id", auth, admin, validateObjectId, genre.deleteGenre);

router.post("/count", async (req, res) => {
  const { genre } = req.body;
  let query = {};
  console.log(genre);
  if (!genre) {
    let genres = await Genre.find();
    return res.send(genres.length + "");
  }
  query["genre"] = new RegExp(`^${genre}`, "i");
  const totalNoOfGenres = await Genre.find(query).countDocuments();
  res.status(200).send(totalNoOfGenres + "");
});

router.post("/pfs", async (req, res) => {
  const { pageSize, currentPage, genre } = req.body;
  let skip = 0;
  let limit = 0;
  let query = {};
  if (pageSize && currentPage) {
    skip = (currentPage - 1) * pageSize;
    limit = pageSize;
  }
  query["genre"] = new RegExp(`^${genre}`, "i");
  if (!genre) {
    let genres = await Genre.find().limit(limit).skip(skip);
    return res.send(genres);
  }
  let genres = await Genre.find(query).limit(limit).skip(skip);
  res.send(movies);
});

module.exports = router;
