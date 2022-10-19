const mongoose = require("mongoose");
const app = require("../../../src/app");
const supertest = require("supertest");
const { Genre } = require("../../../model/Genre");
const { User } = require("../../../model/User");
const req = supertest(app);

describe("/genres", () => {
  afterEach(async () => {
    await Genre.deleteMany({});
  });
  describe("/ GET", () => {
    it("should return All genres from the Databases", async () => {
      await Genre.collection.insertMany([
        { name: "Action" },
        { name: "Drama" },
      ]);
      const res = await req.get("/genres/");
      expect(res.status).toBe(200);

      expect(res.body.some((g) => g.name === "Action")).toBeTruthy();
      expect(res.body.some((g) => g.name === "Drama")).toBeTruthy();
    });

    it("should return 404 if no genres are found", async () => {
      const res = await req.get("/genres");
      expect(res.status).toBe(404);
    });
  });

  describe("/ GET/:id", () => {
    it("should return 400 status if id is Invalid", async () => {
      const res = await req.get("/genres/" + 1);
      expect(res.status).toBe(400);
    });

    it("should return 404 if no customer is not found with given Id", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await req.get("/genres/" + id);
      expect(res.status).toBe(404);
    });

    it("should return a genre if id is Valid", async () => {
      const genre = new Genre({
        name: "Comedy",
      });
      await genre.save();
      const res = await req.get("/genres/" + genre._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", genre.name);
    });
  });

  describe("/ POST", () => {
    it("should return 401 if no token is provided", async () => {
      const res = await req.post("/genres").send({ name: "Actoiin" });
      expect(res.status).toBe(401);
    });

    it("should return 400 if genre name is less than 3 characters", async () => {
      const token = new User().getAuthToken();
      const res = await req
        .post("/genres")
        .set("x-auth-token", token)
        .send({ name: "g1" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if genre name is greater than 50 characters", async () => {
      const token = new User().getAuthToken();
      const name = new Array(52).join("a");
      const res = await req.post("/genres").set("x-auth-token", token).send({
        name,
      });
      expect(res.status).toBe(400);
    });

    it("should save the genre", async () => {
      const token = new User().getAuthToken();
      const res = await req.post("/genres").set("x-auth-token", token).send({
        name: "Drama",
      });
      const genre = await Genre.findOne({ name: "Drama" });
      expect(genre).not.toBeNull();
      expect(genre).toHaveProperty("name", "Drama");
    });

    it("should return  the genre", async () => {
      const token = new User().getAuthToken();
      const res = await req.post("/genres").set("x-auth-token", token).send({
        name: "Comedy",
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", "Comedy");
    });
  });

  describe("/ PUT/:id", () => {
    it("should return 401 if client is not logged in", async () => {
      // const token = await new User({ isAdmin: false }).getAuthToken();
      const genre = new Genre({ name: "Romantic" });
      await genre.save();
      const res = await req.put("/genres/" + genre._id);
      expect(res.status).toBe(401);
    });
  });

  it("should return 400 if name is less than 3 characters", async () => {
    const token = new User({ isAdmin: true }).getAuthToken();
    const genre = new Genre({ name: "Horror" });
    await genre.save();
    const res = await req
      .put("/genres/" + genre._id)
      .set("x-auth-token", token)
      .send({
        name: "Dr",
      });
    expect(res.status).toBe(400);
  });

  it("should return 400 if name is more than 50 characters", async () => {
    const token = new User({ isAdmin: true }).getAuthToken();
    const genre = new Genre({ name: "Horror" });
    await genre.save();
    const name = new Array(52).join("a");
    const res = await req
      .put("/genres/" + genre._id)
      .set("x-auth-token", token)
      .send({
        name,
      });
    expect(res.status).toBe(400);
  });

  it("should return 400 if id is invalid", async () => {
    const token = await new User({ isAdmin: true }).getAuthToken();
    const res = await req
      .put("/genres/" + 12)
      .set("x-auth-token", token)
      .send({
        name: "Sci-Fi",
      });
    expect(res.status).toBe(400);
  });

  it("should return 404 if genre with the given id was not found", async () => {
    const token = new User({ isAdmin: true }).getAuthToken();
    const id = new mongoose.Types.ObjectId(12);

    const res = await req
      .put("/genres/" + id)
      .set("x-auth-token", token)
      .send({
        name: "Drama",
      });
    expect(res.status).toBe(404);
  });

  it("should update the genre if the input is valid", async () => {
    const genre = new Genre({
      name: "Drama",
    });
    await genre.save();
    const token = new User({ isAdmin: true }).getAuthToken();
    const res = await req
      .put("/genres/" + genre._id)
      .set("x-auth-token", token)
      .send(genre);
    const updatedGenre = await Genre.findById(genre._id);
    expect(updatedGenre.name).toBe("Drama");
  });

  it("should send updated genre to the client", async () => {
    const token = new User({ isAdmin: true }).getAuthToken();
    const genre = new Genre({ name: "Sports" });
    await genre.save();
    const res = await req
      .put("/genres/" + genre._id)
      .set("x-auth-token", token)
      .send(genre);
    expect(res.body).toHaveProperty("_id");
    expect(res.body).toHaveProperty("name", "Sports");
  });

  describe("/ DELETE/:id", () => {
    it("should return 401 if client is not logged in", async () => {
      const genre = new Genre({
        name: "Thriller",
      });
      await genre.save();
      const res = await req.delete("/genres/" + genre._id);
      expect(res.status).toBe(401);
    });

    it("should return 403 if the user is not an admin", async () => {
      const token = new User({ isAdmin: false }).getAuthToken();
      const genre = new Genre({
        name: "Historical",
      });
      await genre.save();
      const res = await req
        .delete("/genres/" + genre._id)
        .set("x-auth-token", token);
      expect(res.status).toBe(403);
    });

    it("should return 400 if id is invalid", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const res = await req.delete("/genres/23").set("x-auth-token", token);
      expect(res.status).toBe(400);
    });

    it("should return 404 if genre with given id is not found", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const id = new mongoose.Types.ObjectId();
      const res = await req.delete("/genres/" + id).set("x-auth-token", token);
      expect(res.status).toBe(404);
    });

    it("should delete genre if input is valid", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const genre = new Genre({ name: "Suspense" });
      await genre.save();
      const res = await req
        .delete("/genres/" + genre._id)
        .set("x-auth-token", token);
      const deletdGenre = await Genre.findById(genre._id);
      expect(deletdGenre).toBeNull();
    });

    it("should return the deleted genre", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const genre = new Genre({
        name: "Comedy",
      });
      await genre.save();
      const res = await req
        .delete("/genres/" + genre._id)
        .set("x-auth-token", token);
      // expect(res.body).toHaveProperty("name");
      expect(res.body).toHaveProperty("name", "Comedy");
    });
  });
});
