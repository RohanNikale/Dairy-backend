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
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String
    },
    tags: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    likesCount: { type: Number, default: 0 },
});

module.exports = mongoose.model('Post', PostSchema);
