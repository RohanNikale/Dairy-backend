const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Add this field
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }, // Add this field
  type: { type: String, required: true }, // e.g., 'new_follower'
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
