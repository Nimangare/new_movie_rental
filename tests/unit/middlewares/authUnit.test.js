const { default: mongoose } = require("mongoose");
const supertest = require("supertest");
const app = require("../../../src/app");
const user = require("../../../controller/user");
const auth = require("../../../middleware/auth");
const { Genre } = require("../../../model/Genre");
const { User } = require("../../../model/User");
const req = supertest(app);

describe(" /AUTH", () => {
  afterEach(async () => {
    await Genre.collection.deleteMany({});
  });

  it("should populate req with decoded", () => {
    const user = new User({
      _id: new mongoose.Types.ObjectId(),
      isAdmin: true,
    });

    const token = new User(user).getAuthToken();

    const req = {
      header: jest.fn().mockReturnValue(token),
    };
    const res = {};
    const next = jest.fn();

    auth(req, res, next);

    expect(req.user).toHaveProperty("_id", user._id.toHexString());
    expect(req.user).toHaveProperty("isAdmin", user.isAdmin);
  });
});
