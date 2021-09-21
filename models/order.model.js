const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
  transporterName: {
    type: String,
    required: true,
  },
  transporterPhoneNumber: {
    type: String,
    required: true,
  },
  recipientPhoneNumber: {
    type: String,
    required: true,
    min: 10,
    max: 10,
  },
  receivePlace: {
    type: String,
    required: true,
  },
  quantity: {
    type: String,
    required: true,
  },
  transportFee: {
    type: Number,
  },
  moneyHelpCollect: {
    type: Number,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', orderSchema);
