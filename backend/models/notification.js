const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    message: { type: String, required: true, trim: true },
    userId: { type: String, required: true },  // Added userId field to link notifications to a user
    community: { type: String, required: false, trim: true, default: 'none' },
    createdAt: { type: Date, default: Date.now }
});

notificationSchema.index({ userId: 1, createdAt: -1 });  // Added index for userId and createdAt

module.exports = mongoose.model('Notification', notificationSchema);
