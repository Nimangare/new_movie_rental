const express = require("express");

const router = express.Router();
const customer = require("../controller/customer");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");

router.get("/customers", customer.getAllCustomers);

router.post("/customers", auth, customer.createNewCustomer);

router.get("/customers/:id", validateObjectId, customer.getOneCustomer);

router.put(
  "/customers/:id",
  auth,
  admin,
  validateObjectId,
  customer.updateCustomer
);

router.delete(
  "/customers/:id",
  auth,
  admin,
  validateObjectId,
  customer.deleteCustomer
);

module.exports = router;
