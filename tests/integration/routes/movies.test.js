const mongoose = require("mongoose");
const app = require("../../../src/app");
const supertest = require("supertest");
const { User } = require("../../../model/User");
const { Movie } = require("../../../model/Movie");
const { Genre } = require("../../../model/Genre");
const movie = require("../../../controller/movie");

const req = supertest(app);

describe("/movies", () => {
  afterEach(async () => {
    await Movie.deleteMany({});
  });
  describe("/ GET", () => {
    it("should return All movies from the Databases", async () => {
      const genre = new Genre({
        name: "Sports",
      });
      await genre.save();
      await Movie.collection.insertMany([
        {
          title: "Robot",
          genre,
          dailyRentalRate: 10,
          numberInStock: 15,
          liked: true,
        },
      ]);
      const res = await req.get("/movies/");
      expect(res.status).toBe(200);

      expect(res.body.some((m) => m.title === "Robot")).toBeTruthy();
      expect(res.body.some((m) => m.dailyRentalRate === 10)).toBeTruthy();
      expect(res.body.some((m) => m.liked === true)).toBeTruthy();
    });

    it("should return 404 if no movies are found", async () => {
      const res = await req.get("/movies");
      expect(res.status).toBe(404);
    });
  });

  describe("/ GET/:id", () => {
    it("should return 400 status if id is Invalid", async () => {
      const res = await req.get("/movies/" + 1);
      expect(res.status).toBe(400);
    });

    it("should return 404 if no customer is not found with given Id", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await req.get("/movies/" + id);
      expect(res.status).toBe(404);
    });

    it("should return a movie if id is Valid", async () => {
      const genre = new Genre({ name: "Sports" });
      await genre.save();
      const movie = new Movie({
        title: "Dangal",
        genre,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      await movie.save();
      const res = await req.get("/movies/" + movie._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("title", movie.title);
      expect(res.body).toHaveProperty("liked", movie.liked);
    });
  });

  describe("/ POST", () => {
    it("should return 401 if no token is provided", async () => {
      const genre = new Genre({ name: "Sports" });
      await genre.save();
      const res = await req.post("/movies").send({
        title: "Dangal",
        genre,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      expect(res.status).toBe(401);
    });

    it("should return 400 if movie title is less than 5 characters", async () => {
      const token = new User().getAuthToken();
      const res = await req
        .post("/movies")
        .set("x-auth-token", token)
        .send({ title: "War" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if movie title is greater than 10 characters", async () => {
      const token = new User().getAuthToken();
      const title = new Array(12).join("a");
      const res = await req.post("/movies").set("x-auth-token", token).send({
        title,
      });
      expect(res.status).toBe(400);
    });

    it("should return 400 if movie dailyRentalRate is less than 0 digit", async () => {
      const token = new User().getAuthToken();
      const res = await req
        .post("/movies")
        .set("x-auth-token", token)
        .send({ dailyRentalRate: -1 });
      expect(res.status).toBe(400);
    });

    it("should return 400 if dailyRentalRate is greater than 10 digit", async () => {
      const token = new User().getAuthToken();
      const dailyRentalRate = new Array(12).join(1);
      const res = await req.post("/movies").set("x-auth-token", token).send({
        dailyRentalRate,
      });
      expect(res.status).toBe(400);
    });

    it("should return 400 if movie numberInStock is less than 0 digit", async () => {
      const token = new User().getAuthToken();
      const res = await req
        .post("/movies")
        .set("x-auth-token", token)
        .send({ numberInStock: -1 });
      expect(res.status).toBe(400);
    });

    it("should return 400 if numberInStock is greater than 50 digit", async () => {
      const token = new User().getAuthToken();
      const numberInStock = new Array(52).join(1);
      const res = await req.post("/movies").set("x-auth-token", token).send({
        numberInStock,
      });
      expect(res.status).toBe(400);
    });

    it("should save the movie", async () => {
      const token = new User().getAuthToken();
      const genre = new Genre({ name: "Sports" });
      await genre.save();
      const res = await req.post("/movies").set("x-auth-token", token).send({
        title: "Dangal",
        genreId: genre._id,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      const movie = await Movie.findById(res.body._id);
      expect(res.status).toBe(200);
      expect(movie).not.toBeNull();
    });

    it("should return  the movie", async () => {
      const token = new User().getAuthToken();
      const genre = new Genre({ name: "Sports" });
      await genre.save();
      const res = await req.post("/movies").set("x-auth-token", token).send({
        title: "Dangal",
        genreId: genre._id,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("title", "Dangal");
    });
  });

  describe("/ PUT/:id", () => {
    it("should return 401 if client is not logged in", async () => {
      const genre = new Genre({ name: "Sports" });
      await genre.save();
      const movie = new Movie({
        title: "Dangal",
        genre,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      await movie.save();
      const res = await req.put("/movies/" + movie._id);
      expect(res.status).toBe(401);
    });

    it("should return 400 if token is invalid", async () => {
      const genre = new Genre({ name: "Sports" });
      await genre.save();
      const movie = new Movie({
        title: "Dangal",
        genre,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      await movie.save();
      const res = await req
        .put("/movies/" + movie._id)
        .set("x-auth-test", "abcd");
      expect(res.status).toBe(401);
    });
    it("should return 403 if user is not Admin", async () => {
      const genre = new Genre({ name: "Sports" });
      await genre.save();
      const token = new User().getAuthToken();
      const movie = new Movie({
        title: "Dangal",
        genre,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      await movie.save();
      const res = await req
        .put("/movies/" + movie._id)
        .set("x-auth-token", token)
        .send({ title: "Dangal" });
      expect(res.status).toBe(403);
    });

    it("should return 400 if movie title is less than 5 characters", async () => {
      const genre = new Genre({ name: "Sports" });
      await genre.save();
      const token = new User({ isAdmin: true }).getAuthToken();
      const movie = new Movie({
        title: "Dangal",
        genre,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      await movie.save();
      const res = await req
        .put("/movies/" + movie._id)
        .set("x-auth-token", token)
        .send({ title: "War" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if movie title is greater than 10 characters", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const genre = new Genre({ name: "Sports" });
      await genre.save();
      const movie = new Movie({
        title: "Dangal",
        genre,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      await movie.save();
      //   const title = new Array(15).join("a");
      const res = await req
        .put("/movies/" + movie._id)
        .set("x-auth-token", token)
        .send({
          title: new Array(1234).join("A"),
        });
      expect(res.status).toBe(400);
    });

    it("should return 400 if movie dailyRentalRate is less than 0 digit", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const genre = new Genre({ name: "Sports" });
      await genre.save();
      const movie = new Movie({
        title: "Dangal",
        genre,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      await movie.save();
      const res = await req
        .put("/movies/" + movie._id)
        .set("x-auth-token", token)
        .send({ dailyRentalRate: -1 });
      expect(res.status).toBe(400);
    });

    it("should return 400 if dailyRentalRate is greater than 10 digit", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const genre = new Genre({ name: "Sports" });
      await genre.save();
      const movie = new Movie({
        title: "Dangal",
        genre,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      await movie.save();
      const dailyRentalRate = new Array(12).join(1);
      const res = await req
        .put("/movies/" + movie._id)
        .set("x-auth-token", token)
        .send({
          dailyRentalRate,
        });
      expect(res.status).toBe(400);
    });

    it("should return 400 if movie numberInStock is less than 0 digit", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const genre = new Genre({ name: "Sports" });
      await genre.save();
      const movie = new Movie({
        title: "Dangal",
        genre,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      await movie.save();
      const res = await req
        .put("/movies/" + movie._id)
        .set("x-auth-token", token)
        .send({ numberInStock: -1 });
      expect(res.status).toBe(400);
    });

    it("should return 400 if numberInStock is greater than 50 digit", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const genre = new Genre({ name: "Sports" });
      await genre.save();
      const movie = new Movie({
        title: "Dangal",
        genre,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      await movie.save();
      const numberInStock = new Array(52).join(1);
      const res = await req
        .put("/movies/" + movie._id)
        .set("x-auth-token", token)
        .send({
          numberInStock,
        });
      expect(res.status).toBe(400);
    });
    it("should return 400 if id is invalid", async () => {
      const token = await new User({ isAdmin: true }).getAuthToken();
      const genre = new Genre({ name: "Sports" });
      await genre.save();
      const res = await req
        .put("/movies/" + 12)
        .set("x-auth-token", token)
        .send({
          title: "Dangal",
          genre,
          dailyRentalRate: 10,
          numberInStock: 15,
          liked: false,
        });
      expect(res.status).toBe(400);
    });

    it("should return 404 if movie with the given id was not found", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const id = new mongoose.Types.ObjectId();
      const genre = new Genre({ name: "Sports" });
      await genre.save();
      const res = await req
        .put("/movies/" + id)
        .set("x-auth-token", token)
        .send({
          title: "Dangal",
          genre,
          dailyRentalRate: 10,
          numberInStock: 15,
          liked: false,
        });
      expect(res.status).toBe(404);
    });

    it("should update the movie if the input is valid", async () => {
      const genre = new Genre({ name: "Sports" });
      await genre.save();
      const movie = new Movie({
        title: "Dangal",
        genre,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      await movie.save();
      const token = new User({ isAdmin: true }).getAuthToken();
      const res = await req
        .put("/movies/" + movie._id)
        .set("x-auth-token", token)
        .send(movie);
      const updateMovie = await Movie.findById(movie._id);
      expect(updateMovie.title).toBe("Dangal");
    });

    it("should send updated movie to the client", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const genre = new Genre({ name: "Sports" });
      await genre.save();
      const movie = new Movie({
        title: "Dangal",
        genre,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      await movie.save();
      const res = await req
        .put("/movies/" + movie._id)
        .set("x-auth-token", token)
        .send(movie);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("title", "Dangal");
    });
  });

  describe("/ DELETE/:id", () => {
    it("should return 401 if client is not logged in", async () => {
      const genre = new Genre({ name: "Sports" });
      await genre.save();
      const movie = new Movie({
        title: "Dangal",
        genre,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      await movie.save();
      const res = await req.delete("/movies/" + movie._id);
      expect(res.status).toBe(401);
    });

    it("should return 403 if the user is not an admin", async () => {
      const token = new User({ isAdmin: false }).getAuthToken();
      const genre = new Genre({ name: "Sports" });
      await genre.save();
      const movie = new Movie({
        title: "Dangal",
        genre,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      await movie.save();
      const res = await req
        .delete("/movies/" + movie._id)
        .set("x-auth-token", token);
      expect(res.status).toBe(403);
    });

    it("should return 400 if id is invalid", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const res = await req.delete("/movies/23").set("x-auth-token", token);
      expect(res.status).toBe(400);
    });

    it("should return 404 if movie with given id is not found", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const id = new mongoose.Types.ObjectId();
      const res = await req.delete("/movies/" + id).set("x-auth-token", token);
      expect(res.status).toBe(404);
    });

    it("should delete movie if input is valid", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const genre = new Genre({ name: "Sports" });
      await genre.save();
      const movie = new Movie({
        title: "Dangal",
        genre,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      await movie.save();
      const res = await req
        .delete("/movies/" + movie._id)
        .set("x-auth-token", token);
      const deleteMovie = await Movie.findById(movie._id);
      expect(deleteMovie).toBeNull();
    });

    it("should return the deleted movie", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const genre = new Genre({ name: "Sports" });
      await genre.save();
      const movie = new Movie({
        title: "Dangal",
        genre,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      await movie.save();
      const res = await req
        .delete("/movies/" + movie._id)
        .set("x-auth-token", token);
      expect(res.body).toHaveProperty("title");
      expect(res.body).toHaveProperty("title", "Dangal");
    });
  });
});
