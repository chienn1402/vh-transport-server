const mongoose = require('mongoose');

const transporterSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    min: 10,
    max: 10,
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

module.exports = mongoose.model('Transporter', transporterSchema);
