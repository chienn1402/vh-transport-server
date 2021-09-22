const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    min: 6,
  },
  email: {
    type: String,
    required: true,
    min: 6,
    max: 255,
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max: 1024,
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

module.exports = mongoose.model('User', userSchema);
