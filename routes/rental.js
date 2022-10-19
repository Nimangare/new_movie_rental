const express = require("express");

const router = express.Router();

const rental = require("../controller/rental");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");

router.post("/rentals", auth, rental.createRental);

router.get("/rentals", rental.getAllRentals);

router.get("/rentals/:id", validateObjectId, rental.getOneRentals);

router.patch(
  "/rentals/:id",
  auth,
  admin,
  validateObjectId,
  rental.updateRental
);

router.delete(
  "/rentals/:id",
  auth,
  admin,
  validateObjectId,
  rental.deleteRental
);

router.put(
  "/rentals/:id",
  auth,
  admin,
  validateObjectId,
  async (req, res, next) => {
    try {
      const obj = await Rental.findById(req.params.id);
      const rental = await Rental.findByIdAndUpdate(req.params.id, {
        $set: {
          customer: {
            name: req.body.name || obj.customer.name,
            phone: req.body.phone || obj.customer.phone,
          },
        },
      });

      res.status(200).send(rental);
    } catch (err) {
      res.status(401).send(err.message);
    }
  }
);

module.exports = router;
