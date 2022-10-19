const { Customer, validateCustomer } = require("../model/Customer");

module.exports = {
  getAllCustomers: async (req, res) => {
    try {
      const customer = await Customer.find();
      if (customer && customer.length === 0) {
        return res.status(404).send("Customer is Not Found");
      }
      res.status(200).send(customer);
    } catch (err) {
      res.status(400).send(err.message);
    }

    // next();
  },
  getOneCustomer: async (req, res) => {
    try {
      const customer = await Customer.findById(req.params.id);
      if (!customer) {
        return res.status(404).send("Customer is Not Found");
      }
      res.status(200).send(customer);
    } catch (err) {
      res.status(400).send(err);
    }
  },
  createNewCustomer: async (req, res) => {
    try {
      const { error } = validateCustomer(req.body);
      if (error) {
        return res.status(400).send(error.details[0].message);
      }
      const customer = new Customer(req.body);

      await customer.save();
      res.status(200).send(customer);
    } catch (err) {
      res.status(400).send(err.message);
    }
  },
  updateCustomer: async (req, res) => {
    try {
      const customer = await Customer.findById(req.params.id);
      if (!customer) {
        return res.status(404).send("Customer is Not Found");
      }
      const result = await Customer.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            name: req.body.name || customer.name,
            phone: req.body.phone || customer.phone,
            isGold: req.body.isGold || customer.isGold,
          },
        },
        { new: true, runValidators: true }
      );
      res.status(200).send(result);
    } catch (err) {
      res.status(400).send(err.message);
    }
  },
  deleteCustomer: async (req, res) => {
    try {
      const customer = await Customer.findByIdAndDelete(req.params.id);
      if (!customer) {
        return res.status(404).send("Customer is Not Found");
      }
      res.status(200).send(customer);
    } catch (err) {
      res.status(400).send(err);
    }
  },
};
