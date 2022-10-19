const mongoose = require("mongoose");
const app = require("../../../src/app");
const supertest = require("supertest");
const { User } = require("../../../model/User");
const { Movie } = require("../../../model/Movie");
const { Genre } = require("../../../model/Genre");

const { Rental } = require("../../../model/Rental");
const { Customer } = require("../../../model/Customer");

const req = supertest(app);

describe(" /rentals", () => {
  afterEach(async () => {
    await Rental.deleteMany({});
    await Movie.deleteMany({});
    await Customer.deleteMany({});
    await Genre.deleteMany({});
  });

  describe("/ GET", () => {
    it("should return All rentals from the Databases", async () => {
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
      const customer = new Customer({ name: "Nitin", phone: "9730828016" });
      await customer.save();
      await Rental.collection.insertMany([
        {
          customerId: customer._id,
          movieId: movie._id,
          rentalFee: movie.dailyRentalRate * 10,
        },
      ]);
      const res = await req.get("/rentals");
      expect(res.status).toBe(200);
    });

    it("should return 404 if no rentals are found", async () => {
      const res = await req.get("/rentals");
      expect(res.status).toBe(404);
    });
  });

  describe("/ GET/:id", () => {
    it("should return 400 status if id is Invalid", async () => {
      const res = await req.get("/rentals/" + 1);
      expect(res.status).toBe(400);
    });

    it("should return 404 if no customer is not found with given Id", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await req.get("/rentals/" + id);
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
      const customer = new Customer({ name: "Nitin", phone: "9730828016" });
      await customer.save();
      const rental = new Rental({
        customer: {
          name: customer.name,
          phone: customer.phone,
        },
        movie,
        rentalFee: movie.dailyRentalRate * 10,
      });
      await rental.save();
      const res = await req.get("/rentals/" + rental._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("movie", rental.movie._id.toHexString());
    });
  });

  describe("/ POST", () => {
    it("should return 401 if no token is provided", async () => {
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
      const customer = new Customer({ name: "Nitin", phone: "9730828016" });
      await customer.save();
      const res = await req.post("/rentals").send({
        customerId: customer._id,
        movieId: movie._id,
        rentalFee: movie.dailyRentalRate * 10,
      });
      expect(res.status).toBe(401);
    });

    it("should return 400 if genre name is less than 3 characters", async () => {
      const genre = new Genre({ name: "Action" });
      await genre.save();
      const movie = new Movie({
        title: "Dangal",
        genre,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      await movie.save();
      const customer = new Customer({ name: "Nitin", phone: "9730828016" });
      await customer.save();

      genre.name = "Ac";
      const token = new User().getAuthToken();
      const res = await req
        .post("/rentals")
        .set("x-auth-token", token)
        .send({
          customerId: customer._id,
          movieId: movie._id,
          rentalFee: movie.dailyRentalRate * 10,
        });

      expect(res.status).toBe(400);
    });

    it("should return 400 if genre name is greater than 50 characters", async () => {
      const genre = new Genre({ name: "Action" });
      await genre.save();
      const movie = new Movie({
        title: "Dangal",
        genre,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      await movie.save();
      const customer = new Customer({ name: "Nitin", phone: "9730828016" });
      await customer.save();
      genre.name = new Array(52).join("x");
      const token = new User().getAuthToken();
      const res = await req
        .post("/rentals")
        .set("x-auth-token", token)
        .send({
          customerId: customer._id,
          movieId: movie._id,
          rentalFee: movie.dailyRentalRate * 10,
        });
      expect(res.status).toBe(400);
    });

    it("should return 400 if movie title is less than 5 characters", async () => {
      const genre = new Genre({ name: "Sports" });
      await genre.save();
      const customer = new Customer({ name: "Nitin", phone: "9730828016" });
      await customer.save();
      const movie = new Movie({
        title: "Dangal",
        genre,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      await movie.save();
      const token = new User().getAuthToken();
      movie.title = "Da";
      const res = await req
        .post("/rentals")
        .set("x-auth-token", token)
        .send({
          customerId: customer._id,
          movieId: movie._id,
          rentalFee: movie.dailyRentalRate * 10,
        });
      expect(res.status).toBe(400);
    });

    it("should return 400 if movie title is greater than 10 characters", async () => {
      const genre = new Genre({ name: "Sports" });
      await genre.save();
      const customer = new Customer({ name: "Nitin", phone: "9730828016" });
      await customer.save();
      const movie = new Movie({
        title: "Dangal",
        genre,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      await movie.save();
      const token = new User().getAuthToken();
      movie.title = new Array(12).join("a");
      const res = await req
        .post("/rentals")
        .set("x-auth-token", token)
        .send({
          customerId: customer._id,
          movieId: movie._id,
          rentalFee: movie.dailyRentalRate * 10,
        });
      expect(res.status).toBe(400);
    });

    it("should return 400 if movie dailyRentalRate is less than 0 digit", async () => {
      const genre = new Genre({ name: "Sports" });
      await genre.save();
      const customer = new Customer({ name: "Nitin", phone: "9730828016" });
      await customer.save();
      const movie = new Movie({
        title: "Dangal",
        genre,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      await movie.save();
      const token = new User().getAuthToken();
      movie.dailyRentalRate = -1;
      const res = await req
        .post("/rentals")
        .set("x-auth-token", token)
        .send({
          customerId: customer._id,
          movieId: movie._id,
          rentalFee: movie.dailyRentalRate * 10,
        });
      expect(res.status).toBe(400);
    });

    it("should return 400 if dailyRentalRate is greater than 10 digit", async () => {
      const genre = new Genre({ name: "Sports" });
      await genre.save();
      const customer = new Customer({ name: "Nitin", phone: "9730828016" });
      await customer.save();
      const movie = new Movie({
        title: "Dangal",
        genre,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      await movie.save();
      const token = new User().getAuthToken();
      const dailyRentalRate = new Array(12).join(1);
      const res = await req
        .post("/rentals")
        .set("x-auth-token", token)
        .send({
          customerId: customer._id,
          movieId: movie._id,
          rentalFee: movie.dailyRentalRate * 10,
        });
      expect(res.status).toBe(400);
    });

    it("should return 400 if movie numberInStock is less than 0 digit", async () => {
      const genre = new Genre({ name: "Sports" });
      await genre.save();
      const customer = new Customer({ name: "Nitin", phone: "9730828016" });
      await customer.save();
      const movie = new Movie({
        title: "Dangal",
        genre,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      await movie.save();
      const token = new User().getAuthToken();
      movie.numberInStock = -1;
      const res = await req
        .post("/rentals")
        .set("x-auth-token", token)
        .send({
          customerId: customer._id,
          movieId: movie._id,
          rentalFee: movie.dailyRentalRate * 10,
        });
      expect(res.status).toBe(400);
    });

    it("should return 400 if numberInStock is greater than 50 digit", async () => {
      const genre = new Genre({ name: "Sports" });
      await genre.save();
      const customer = new Customer({ name: "Nitin", phone: "9730828016" });
      await customer.save();
      const movie = new Movie({
        title: "Dangal",
        genre,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      await movie.save();
      const token = new User().getAuthToken();
      const numberInStock = new Array(52).join(1);
      const res = await req
        .post("/rentals")
        .set("x-auth-token", token)
        .send({
          customerId: customer._id,
          movieId: movie._id,
          rentalFee: movie.dailyRentalRate * 10,
        });
      expect(res.status).toBe(400);
    });

    it("should return 400 if customer name is less than 5 characters", async () => {
      const genre = new Genre({ name: "Action" });
      await genre.save();
      const movie = new Movie({
        title: "Dangal",
        genre,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      await movie.save();
      const customer = new Customer({ name: "Nitin", phone: "9730828016" });
      await customer.save();

      customer.name = "Jai";

      const token = new User().getAuthToken();
      const res = await req
        .post("/rentals")
        .set("x-auth-token", token)
        .send({
          customerId: customer._id,
          movieId: movie._id,
          rentalFee: movie.dailyRentalRate * 10,
        });
      expect(res.status).toBe(400);
    });
    it("should return 400 if genre name is greate than 50 characters", async () => {
      const genre = new Genre({ name: "Action" });
      await genre.save();
      const movie = new Movie({
        title: "Dangal",
        genre,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      await movie.save();
      const customer = new Customer({ name: "Nitin", phone: "9730828016" });
      await customer.save();

      customer.name = new Array(52).join("x");

      const token = new User().getAuthToken();
      const res = await req
        .post("/rentals")
        .set("x-auth-token", token)
        .send({
          customerId: customer._id,
          movieId: movie._id,
          rentalFee: movie.dailyRentalRate * 10,
        });
      expect(res.status).toBe(400);
    });

    it("should return 400 if customer phone is less than 7 digit", async () => {
      const genre = new Genre({ name: "Action" });
      await genre.save();
      const movie = new Movie({
        title: "Dangal",
        genre,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      await movie.save();
      const customer = new Customer({ name: "Nitin", phone: "1234567890" });
      await customer.save();

      const token = new User().getAuthToken();
      customer.phone = "123456";
      const res = await req
        .post("/rentals")
        .set("x-auth-token", token)
        .send({
          customerId: customer._id,
          movieId: movie._id,
          rentalFee: movie.dailyRentalRate * 10,
        });
      expect(res.status).toBe(400);
    });

    it("should return 400 if customer phone is greater than 10 digit", async () => {
      const genre = new Genre({ name: "Action" });
      await genre.save();
      const movie = new Movie({
        title: "Dangal",
        genre,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      await movie.save();
      const customer = new Customer({
        name: "Nitin",
        phone: "9730828016",
      });
      await customer.save();

      customer.phone = new Array(15).join(9);
      const token = new User().getAuthToken();
      const res = await req
        .post("/rentals")
        .set("x-auth-token", token)
        .send({
          customerId: customer._id,
          movieId: movie._id,
          rentalFee: movie.dailyRentalRate * 10,
        });

      expect(res.status).toBe(400);
    });

    it("should return 400 if rental has invalid customer objectId", async () => {
      const genre = new Genre({ name: "Action" });
      await genre.save();
      const movie = new Movie({
        title: "Dangal",
        genre,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      await movie.save();

      const id = mongoose.Types.ObjectId();

      const token = new User().getAuthToken();
      const res = await req
        .post("/rentals")
        .set("x-auth-token", token)
        .send({
          customerId: id,
          movieId: movie._id,
          rentalFee: movie.dailyRentalRate * 10,
        });

      expect(res.status).toBe(400);
    });

    it("should return 400 if rental has invalid movie objectId", async () => {
      const customer = new Customer({
        name: "Nitin",
        phone: "9730828016",
      });
      const genre = new Genre({ name: "Action" });
      const movie = new Movie({
        title: "Dangal",
        genre,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      await movie.save();
      await customer.save();
      const id = mongoose.Types.ObjectId();

      const token = new User().getAuthToken();
      const res = await req
        .post("/rentals")
        .set("x-auth-token", token)
        .send({
          customerId: customer._id,
          movieId: id,
          rentalFee: movie.dailyRentalRate * 10,
        });

      expect(res.status).toBe(400);
    });
    it("should save the rental", async () => {
      const genre = new Genre({ name: "Action" });
      await genre.save();
      const movie = new Movie({
        title: "Dangal",
        genre,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      await movie.save();
      const customer = new Customer({
        name: "Nitin",
        phone: "9730828016",
      });
      await customer.save();

      const token = new User().getAuthToken();

      const res = await req.post("/rentals").set("x-auth-token", token).send({
        customerId: customer._id,
        movieId: movie._id,
      });

      expect(res.status).toBe(200);
      // expect(movie).not.toBeNull();
    });

    it("should return 404 if customer with given Id is Not found", async () => {
      const token2 = new User().getAuthToken();
      const res = await req
        .post("/rentals/")
        .set("x-auth-token", token2)
        .send({
          customerId: mongoose.Types.ObjectId(12),
          movieId: mongoose.Types.ObjectId(99),
        });
      expect(res.status).toBe(404);
    });

    it("should return  the movie", async () => {
      const genre = new Genre({ name: "Action" });
      await genre.save();
      const movie = new Movie({
        title: "Dangal",
        genre,
        dailyRentalRate: 10,
        numberInStock: 15,
        liked: false,
      });
      await movie.save();
      const customer = new Customer({
        name: "Nitin",
        phone: "9730828016",
      });
      await customer.save();

      const token = new User().getAuthToken();

      const res = await req.post("/rentals").set("x-auth-token", token).send({
        customerId: customer._id,
        movieId: movie._id,
      });
      expect(res.status).toBe(200);
      // expect(res.body).toHaveProperty("customer", customer);
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
      const customer = new Customer({ name: "Nitin", phone: "9730828016" });
      await customer.save();
      const rental = new Rental({
        customer: {
          name: customer.name,
          phone: customer.phone,
        },
        movie,
        rentalFee: movie.dailyRentalRate * 10,
      });
      await rental.save();
      const res = await req.put("/rentals/" + rental._id).send({});
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
      const customer = new Customer({
        name: "Nitin",
        phone: "9730828016",
      });
      await customer.save();
      const rental = new Rental({
        customer: {
          name: customer.name,
          phone: customer.phone,
        },
        movie,
        rentalFee: movie.dailyRentalRate * 10,
      });
      await rental.save();
      const res = await req
        .put("/rentals/" + rental._id)
        .set("x-auth-token", "abcd")
        .send({});
      expect(res.status).toBe(400);
    });
    it("should return 403 if user is not Admin", async () => {
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
      const customer = new Customer({
        name: "Nitin",
        phone: "9730828016",
      });
      await customer.save();
      const rental = new Rental({
        customer: {
          name: customer.name,
          phone: customer.phone,
        },
        movie,
        rentalFee: movie.dailyRentalRate * 10,
      });
      await rental.save();
      const token = new User().getAuthToken();
      const res = await req
        .put("/rentals/" + rental._id)
        .set("x-auth-token", token)
        .send({});
      expect(res.status).toBe(403);
    });

    it("should return 400 if id is invalid", async () => {
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
      const customer = new Customer({ name: "Nitin", phone: "9730828016" });
      await customer.save();
      const rental = new Rental({
        customer: {
          name: customer.name,
          phone: customer.phone,
        },
        movie,
        rentalFee: movie.dailyRentalRate * 10,
      });
      await rental.save();
      const token = await new User({ isAdmin: true }).getAuthToken();
      const res = await req
        .put("/rentals/" + 12)
        .set("x-auth-token", token)
        .send({});
      expect(res.status).toBe(400);
    });

    it("should return 404 if rental with the given id was not found", async () => {
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
      const customer = new Customer({ name: "Nitin", phone: "9730828016" });
      await customer.save();
      const rental = new Rental({
        customer: {
          name: customer.name,
          phone: customer.phone,
        },
        movie,
        rentalFee: movie.dailyRentalRate * 10,
      });
      await rental.save();
      const token = new User({ isAdmin: true }).getAuthToken();
      const id = mongoose.Types.ObjectId();

      const res = await req.patch("/rentals/" + id).set("x-auth-token", token);

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
      const customer = new Customer({ name: "Nitin", phone: "9730828016" });
      await customer.save();
      const rental = new Rental({
        customer: {
          name: customer.name,
          phone: customer.phone,
        },
        movie,
        rentalFee: movie.dailyRentalRate * 10,
      });
      await rental.save();

      const token = new User({ isAdmin: true }).getAuthToken();
      const res = await req
        .put("/rentals/" + rental._id)
        .set("x-auth-token", token)
        .send({
          movieId: movie.id,
        });
      const updateRental = await Rental.findById(rental._id);
      expect(res.status).toBe(200);
      // expect(updateRental.customer).toBe(customer._id.toHexString());
      // expect(updateRental.movie).toBe(movie._id.toHexString());
    });

    it("should send updated rental to the client", async () => {
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
      const customer = new Customer({ name: "Nitin", phone: "9730828016" });
      await customer.save();
      const rental = new Rental({
        customer: {
          name: customer.name,
          phone: customer.phone,
        },
        movie,
        rentalFee: movie.dailyRentalRate * 10,
      });
      await rental.save();
      const token = new User({ isAdmin: true }).getAuthToken();

      const res = await req
        .put("/rentals/" + rental._id)
        .set("x-auth-token", token)
        .send({});
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("customer", customer._id.toHexString());
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
      const customer = new Customer({ name: "Nitin", phone: "9730828016" });
      await customer.save();
      const rental = new Rental({
        customer: {
          name: customer.name,
          phone: customer.phone,
        },
        movie,
        rentalFee: movie.dailyRentalRate * 10,
      });
      const res = await req.delete("/rentals/" + rental._id);
      expect(res.status).toBe(401);
    });

    it("should return 403 if the user is not an admin", async () => {
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
      const customer = new Customer({ name: "Nitin", phone: "9730828016" });
      await customer.save();
      const rental = new Rental({
        customer: {
          name: customer.name,
          phone: customer.phone,
        },
        movie,
        rentalFee: movie.dailyRentalRate * 10,
      });
      await rental.save();
      const token = new User({ isAdmin: false }).getAuthToken();

      const res = await req
        .delete("/rentals/" + rental._id)
        .set("x-auth-token", token);
      expect(res.status).toBe(403);
    });

    it("should return 400 if id is invalid", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const res = await req.delete("/rentals/23").set("x-auth-token", token);
      expect(res.status).toBe(400);
    });

    it("should return 404 if rental with given id is not found", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const id = new mongoose.Types.ObjectId();
      const res = await req.delete("/rentals/" + id).set("x-auth-token", token);
      expect(res.status).toBe(404);
    });

    it("should delete movie if input is valid", async () => {
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
      const customer = new Customer({ name: "Nitin", phone: "9730828016" });
      await customer.save();
      const rental = new Rental({
        customer: {
          name: customer.name,
          phone: customer.phone,
        },
        movie,
        rentalFee: movie.dailyRentalRate * 10,
      });
      await rental.save();
      const token = new User({ isAdmin: true }).getAuthToken();
      const res = await req
        .delete("/rentals/" + rental._id)
        .set("x-auth-token", token);
      const deleteRental = await Rental.findById(rental._id);
      expect(deleteRental).toBeNull();
    });

    it("should return the deleted movie", async () => {
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
      const customer = new Customer({ name: "Nitin", phone: "9730828016" });
      await customer.save();
      const rental = new Rental({
        customer: {
          name: customer.name,
          phone: customer.phone,
        },
        movie,
        rentalFee: movie.dailyRentalRate * 10,
      });
      await rental.save();
      const token = new User({ isAdmin: true }).getAuthToken();

      const res = await req
        .delete("/rentals/" + rental._id)
        .set("x-auth-token", token);
      expect(res.body).toHaveProperty("customer");
      expect(res.body).toHaveProperty("movie", movie._id.toHexString());
    });
  });
});
