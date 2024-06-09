const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const replySchema = new Schema({
    content: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    commentId: { type: Schema.Types.ObjectId, ref: 'Comment', required: true },
    createdAt: { type: Date, default: Date.now }
});

const Reply = mongoose.model('Reply', replySchema);
module.exports = Reply;
