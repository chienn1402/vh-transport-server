const Joi = require('@hapi/joi');

const transporterValidation = (data) => {
  const scheme = Joi.object({
    name: Joi.string().required(),
    phoneNumber: Joi.string().min(10).max(10).required(),
    status: Joi.number(),
  });

  return scheme.validate(data);
};

module.exports = transporterValidation;
