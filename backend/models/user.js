const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  userId: { type: String, default: uuidv4, unique: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['super admin', 'Admin', 'Member'], default: 'Member' },
  community: { type: String, default: 'none' },
  token: { type: String },
  contact: { type: String, required: false, default: '' },
  address: { type: String, required: false, default: '' },
});

module.exports = mongoose.model('User', userSchema);
