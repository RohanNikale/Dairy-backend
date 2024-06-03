const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    username:{
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    likes: [{
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        name: {
          type: String,
          required: true
        },
        username: {
          type: String,
          required: true
        }
      }]
});

module.exports = mongoose.model('Post', PostSchema);
