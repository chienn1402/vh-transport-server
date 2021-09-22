const Joi = require('@hapi/joi');

const orderValidation = (data) => {
  const scheme = Joi.object({
    transporterName: Joi.string().required(),
    transporterTel: Joi.string().min(10).max(10).required(),
    receiverName: Joi.string().required(),
    receiverTel: Joi.string().min(10).max(10).required(),
    receivePlace: Joi.string().required(),
    goods: Joi.string().required(),
    transFee: Joi.number().required(),
    codFee: Joi.number(),
  });

  return scheme.validate(data);
};

module.exports = orderValidation;
