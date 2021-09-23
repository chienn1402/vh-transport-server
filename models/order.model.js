const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
  transporterName: {
    type: String,
    required: true,
  },
  transporterTel: {
    type: String,
    required: true,
  },
  receiverName: {
    type: String,
    required: true,
  },
  receiverTel: {
    type: String,
    required: true,
    min: 10,
    max: 10,
  },
  receivePlace: {
    type: String,
    required: true,
  },
  goods: {
    type: String,
    required: true,
  },
  transFee: {
    type: Number,
    default: 0
  },
  codFee: {
    type: Number,
    default: 0
  },
  totalFee: {
    type: Number,
    default: 0
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: Number,
    default: 1,
  },
});

module.exports = mongoose.model('Order', orderSchema);
