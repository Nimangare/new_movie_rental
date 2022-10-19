const { model, Schema } = require("mongoose");
const Joi = require("joi");

const customerSchema = new Schema({
  name: {
    type: String,
    minLength: 5,
    maxLength: 50,
    required: true,
  },
  phone: {
    type: String,
    minLength: 7,
    maxLength: 10,
    required: true,
  },
  isGold: {
    type: Boolean,
    default: false,
  },
});
const Customer = new model("Customer", customerSchema);

const validateCustomer = (customer) => {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50),
    phone: Joi.string().min(7).max(10).required(),
    isGold: Joi.boolean().default(false),
  });
  return schema.validate(customer);
};
module.exports.Customer = Customer;
module.exports.validateCustomer = validateCustomer;
// module.exports.customerSchema = customerSchema;
