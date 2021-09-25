const Joi = require('joi');

const transporterValidation = (data) => {
  const scheme = Joi.object({
    name: Joi.string().required().messages({
      'string.empty': 'Tên nhà xe không được để trống',
      'string.base': 'Tên nhà xe không đúng định dạng!',
    }),
    phoneNumber: Joi.string().min(10).max(10).required().messages({
      'string.empty': 'Số điện thoại nhà xe không được để trống',
      'string.base': 'Số điện thoại nhà xe không đúng định dạng!',
      'string.min': 'Số điện thoại nhà xe không đúng định dạng!',
      'string.max': 'Số điện thoại nhà xe không đúng định dạng!',
    }),
    status: Joi.number().messages({
      'string.base': 'Trạng thái đơn hàng không đúng định dạng!',
    }),
  });

  return scheme.validate(data);
};

module.exports = transporterValidation;
