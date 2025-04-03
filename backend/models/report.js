const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  selectedIssue: { type: String, required: true },
  issueLocation: { type: String, required: true },
  issueDescription: { type: String, required: true },
  additionalComments: { type: String },
  imagePath: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);
