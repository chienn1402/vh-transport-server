const Joi = require('@hapi/joi');

const orderValidation = (data) => {
  const scheme = Joi.object({
    transporterName: Joi.string().required(),
    transporterPhoneNumber: Joi.string().min(10).max(10).required(),
    recipientPhoneNumber: Joi.string().min(10).max(10).required(),
    receivePlace: Joi.string().required(),
    quantity: Joi.string().required(),
    transportFee: Joi.number().required(),
    moneyHelpCollect: Joi.number(),
  });

  return scheme.validate(data);
};

module.exports = orderValidation;
