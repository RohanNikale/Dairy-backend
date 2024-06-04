const mongoose = require('mongoose');

const followSchema = new mongoose.Schema(
    {
        follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        following: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    { timestamps: true }
);

followSchema.index({ follower: 1 });
followSchema.index({ following: 1 });

const Follow = mongoose.model('Follow', followSchema);

module.exports = Follow;
