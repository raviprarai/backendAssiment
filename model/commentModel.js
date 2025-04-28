const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'blog',
    },
    commentText: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('comment', commentSchema);
