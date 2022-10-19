const { Router } = require("express");

const router = Router();

const user = require("../controller/user");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");

router.post("/users", user.createUser);

router.get("/users", user.getAllUsers);

router.get("/users/:id", auth, admin, validateObjectId, user.getOneUser);

router.post("/users/login", user.loginUser);

router.put("/users/:id", auth, admin, validateObjectId, user.updateUser);

router.patch("/users/:id", auth, admin, validateObjectId, user.updateUser);

router.delete("/users/:id", auth, admin, validateObjectId, user.deleteUser);

module.exports = router;
