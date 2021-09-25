const Joi = require('joi');

const orderValidation = (data) => {
  const scheme = Joi.object({
    transporterName: Joi.string().required().messages({
      'string.empty': 'Tên nhà xe không được để trống',
      'string.base': 'Tên nhà xe không đúng định dạng!'
    }),
    transporterTel: Joi.string().min(10).max(10).required().messages({
      'string.empty': 'Số điện thoại nhà xe không được để trống',
      'string.base': 'Số điện thoại nhà xe không đúng định dạng!',
      'string.min': 'Số điện thoại nhà xe không đúng định dạng!',
      'string.max': 'Số điện thoại nhà xe không đúng định dạng!',
    }),
    receiverName: Joi.string().required().messages({
      'string.empty': 'Tên người nhận không được để trống',
      'string.base': 'Tên người nhận không đúng định dạng!'
    }),
    receiverTel: Joi.string().min(10).max(10).required().messages({
      'string.empty': 'Số điện thoại người nhận không được để trống',
      'string.base': 'Số điện thoại người nhận không đúng định dạng!',
      'string.min': 'Số điện thoại người nhận không đúng định dạng!',
      'string.max': 'Số điện thoại người nhận không đúng định dạng!',
    }),
    receivePlace: Joi.string().required().messages({
      'string.empty': 'Nơi nhận hàng không được để trống',
      'string.base': 'Nơi nhận hàng không đúng định dạng!'
    }),
    goods: Joi.string().required().messages({
      'string.empty': 'Thông tin mặt hàng không được để trống',
      'string.base': 'Thông tin mặt hàng không đúng định dạng!'
    }),
    transFee: Joi.number().required().messages({
      'string.empty': 'Phí giao hàng không được để trống',
      'string.base': 'Phí giao hàng không đúng định dạng!'
    }),
    codFee: Joi.number().messages({
      'string.base': 'Phí thu hộ không đúng định dạng!'
    }),
    status: Joi.number().messages({
      'string.base': 'Trạng thái đơn hàng không đúng định dạng!'
    }),
  });

  return scheme.validate(data);
};

module.exports = orderValidation;
