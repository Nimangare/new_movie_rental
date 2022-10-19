const mongoose = require("mongoose");
const app = require("../../../src/app");
const supertest = require("supertest");
const { User } = require("../../../model/User");
const { Customer } = require("../../../model/Customer");
const customer = require("../../../controller/customer");
const req = supertest(app);

describe("/customers", () => {
  afterEach(async () => {
    await Customer.deleteMany({});
  });
  describe("/ GET", () => {
    it("should return All customers from the Databases", async () => {
      await Customer.collection.insertMany([
        { name: "Nitin", phone: "9730828016", isGold: true },
        { name: "Nitin", phone: "8788633280", isGold: false },
      ]);
      const res = await req.get("/customers/");
      expect(res.status).toBe(200);

      expect(res.body.some((c) => c.name === "Nitin")).toBeTruthy();
      expect(res.body.some((c) => c.isGold === true)).toBeTruthy();
      expect(res.body.some((c) => c.phone === "9730828016")).toBeTruthy();
    });

    it("should return 404 if no customers are found", async () => {
      const res = await req.get("/customers");
      expect(res.status).toBe(404);
    });
  });

  describe("/ GET/:id", () => {
    it("should return 400 status if id is Invalid", async () => {
      const res = await req.get("/customers/" + 1);
      expect(res.status).toBe(400);
    });

    it("should return 404 if no customer is not found with given Id", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await req.get("/customers/" + id);
      expect(res.status).toBe(404);
    });

    it("should return a customer if id is Valid", async () => {
      const customer = new Customer({
        name: "Nitin",
        phone: "9730828016",
        isGold: true,
      });
      await customer.save();
      const res = await req.get("/customers/" + customer._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", customer.name);
      expect(res.body).toHaveProperty("phone", customer.phone);
    });
  });

  describe("/ POST", () => {
    it("should return 401 if no token is provided", async () => {
      const res = await req.post("/customers").send({
        name: "Nitin",
        phone: "9730828016",
        isGold: true,
      });
      expect(res.status).toBe(401);
    });

    it("should return 400 if customer name is less than 5 characters", async () => {
      const token = new User().getAuthToken();
      const res = await req
        .post("/customers")
        .set("x-auth-token", token)
        .send({ name: "Niti" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if genre name is greater than 50 characters", async () => {
      const token = new User().getAuthToken();
      const name = new Array(52).join("a");
      const res = await req.post("/customers").set("x-auth-token", token).send({
        name,
      });
      expect(res.status).toBe(400);
    });

    it("should return 400 if customer name is less than 7 digit", async () => {
      const token = new User().getAuthToken();
      const res = await req
        .post("/customers")
        .set("x-auth-token", token)
        .send({ phone: "123456" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if genre name is greater than 10 digit", async () => {
      const token = new User().getAuthToken();
      const phone = new Array(52).join(1);
      const res = await req.post("/customers").set("x-auth-token", token).send({
        phone,
      });
      expect(res.status).toBe(400);
    });

    it("should save the customer", async () => {
      const token = new User().getAuthToken();
      const res = await req.post("/customers").set("x-auth-token", token).send({
        name: "Nitin",
        phone: "9730828016",
        isGold: true,
      });
      const customer = await Customer.findOne({ name: "Nitin" });
      expect(customer).not.toBeNull();
      expect(customer).toHaveProperty("name", "Nitin");
      expect(customer).toHaveProperty("phone", "9730828016");
    });

    it("should return  the customer", async () => {
      const token = new User().getAuthToken();
      const res = await req.post("/customers").set("x-auth-token", token).send({
        name: "Nitin",
        phone: "9730828016",
        isGold: true,
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", "Nitin");
    });
  });

  describe("/ PUT/:id", () => {
    it("should return 401 if client is not logged in", async () => {
      const customer = new Customer({
        name: "Nitin",
        phone: "9730828016",
        isGold: true,
      });
      await customer.save();
      const res = await req.put("/customers/" + customer._id);
      expect(res.status).toBe(401);
    });

    it("should return 400 if token is invalid", async () => {
      const res = await req
        .put("/customers/" + customer._id)
        .set("x-auth-test", "abcd");
      expect(res.status).toBe(401);
    });
    it("should return 403 if user is not Admin", async () => {
      const token = new User().getAuthToken();
      const customer = new Customer({
        name: "Nitin",
        phone: "9730828016",
        isGold: true,
      });
      await customer.save();
      const res = await req
        .put("/customers/" + customer._id)
        .set("x-auth-token", token)
        .send({ name: "Pradip" });
      expect(res.status).toBe(403);
    });

    it("should return 400 if name is less than 3 characters", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const customer = new Customer({
        name: "Nitin",
        phone: "9730828016",
        isGold: true,
      });
      await customer.save();
      const res = await req
        .put("/customers/" + customer._id)
        .set("x-auth-token", token)
        .send({
          name: "Dr",
        });
      expect(res.status).toBe(400);
    });

    it("should return 400 if name is more than 50 characters", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const customer = new Customer({
        name: "Nitin",
        phone: "9730828016",
        isGold: true,
      });
      await customer.save();
      const name = new Array(52).join("a");
      const res = await req
        .put("/customers/" + customer._id)
        .set("x-auth-token", token)
        .send({
          name,
        });
      expect(res.status).toBe(400);
    });
    it("should return 400 if customer phone is less than 7 digit", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const customer = new Customer({
        name: "Nitin",
        phone: "9730828016",
        isGold: true,
      });
      await customer.save();
      const res = await req
        .put("/customers/" + customer._id)
        .set("x-auth-token", token)
        .send({
          phone: "123456",
        });
      expect(res.status).toBe(400);
    });

    it("should return 400 if genre name is greater than 10 digit", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const customer = new Customer({
        name: "Nitin",
        phone: "9730828016",
        isGold: true,
      });
      await customer.save();
      const phone = new Array(52).join(1);
      const res = await req
        .put("/customers/" + customer._id)
        .set("x-auth-token", token)
        .send({
          phone,
        });
      expect(res.status).toBe(400);
    });

    it("should return 400 if id is invalid", async () => {
      const token = await new User({ isAdmin: true }).getAuthToken();
      const res = await req
        .put("/customers/" + 12)
        .set("x-auth-token", token)
        .send({
          name: "Nitin",
          phone: "9730828016",
          isGold: true,
        });
      expect(res.status).toBe(400);
    });

    it("should return 404 if genre with the given id was not found", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const id = new mongoose.Types.ObjectId(12);

      const res = await req
        .put("/customers/" + id)
        .set("x-auth-token", token)
        .send({
          name: "Nitin",
          phone: "9730828016",
          isGold: true,
        });
      expect(res.status).toBe(404);
    });

    it("should update the genre if the input is valid", async () => {
      const customer = new Customer({
        name: "Nitin",
        phone: "9730828016",
        isGold: true,
      });
      await customer.save();
      const token = new User({ isAdmin: true }).getAuthToken();
      const res = await req
        .put("/customers/" + customer._id)
        .set("x-auth-token", token)
        .send(customer);
      const updateCustomer = await Customer.findById(customer._id);
      expect(updateCustomer.name).toBe("Nitin");
    });

    it("should send updated customer to the client", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const customer = new Customer({
        name: "Nitin",
        phone: "9730828016",
        isGold: true,
      });
      await customer.save();
      const res = await req
        .put("/customers/" + customer._id)
        .set("x-auth-token", token)
        .send(customer);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "Nitin");
    });
  });

  describe("/ DELETE/:id", () => {
    it("should return 401 if client is not logged in", async () => {
      const customer = new Customer({
        name: "Nitin",
        phone: "9730828016",
        isGold: true,
      });
      await customer.save();
      const res = await req.delete("/customers/" + customer._id);
      expect(res.status).toBe(401);
    });

    it("should return 403 if the user is not an admin", async () => {
      const token = new User({ isAdmin: false }).getAuthToken();
      const customer = new Customer({
        name: "Nitin",
        phone: "9730828016",
        isGold: true,
      });
      await customer.save();
      const res = await req
        .delete("/customers/" + customer._id)
        .set("x-auth-token", token);
      expect(res.status).toBe(403);
    });

    it("should return 400 if id is invalid", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const res = await req.delete("/customers/23").set("x-auth-token", token);
      expect(res.status).toBe(400);
    });

    it("should return 404 if genre with given id is not found", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const id = new mongoose.Types.ObjectId();
      const res = await req
        .delete("/customers/" + id)
        .set("x-auth-token", token);
      expect(res.status).toBe(404);
    });

    it("should delete genre if input is valid", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const customer = new Customer({
        name: "Nitin",
        phone: "9730828016",
        isGold: true,
      });
      await customer.save();
      const res = await req
        .delete("/customers/" + customer._id)
        .set("x-auth-token", token);
      const deleteCustomer = await Customer.findById(customer._id);
      expect(deleteCustomer).toBeNull();
    });

    it("should return the deleted genre", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const customer = new Customer({
        name: "Nitin",
        phone: "9730828016",
        isGold: true,
      });
      await customer.save();
      const res = await req
        .delete("/customers/" + customer._id)
        .set("x-auth-token", token);
      expect(res.body).toHaveProperty("name");
      expect(res.body).toHaveProperty("name", "Nitin");
    });
  });
});
