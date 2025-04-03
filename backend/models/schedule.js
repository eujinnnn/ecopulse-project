const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  selectedTime: { type: String, required: true },
  selectedWaste: { type: String, required: true },
  selectedRecyclables: [String],
  pickupDate: { type: String, required: true },
  address: { type: String, required: true }
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;
