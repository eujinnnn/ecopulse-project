const mongoose = require('mongoose');

const pickupTimeSchema = new mongoose.Schema({
  time: { type: String, required: true }
});

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  pickupSchedule: [
    {
      days: { type: String, required: true },
      times: [pickupTimeSchema]
    }
  ]
});

module.exports = mongoose.model('Community', communitySchema);
