const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
  voltage: { type: Number, required: true },
  current: { type: Number, required: true },
  force:   { type: Number, required: true },
  power:   { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Data', dataSchema);
