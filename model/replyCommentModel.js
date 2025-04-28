const mongoose = require('mongoose');

const commentReplySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'blog',
    },
    replyText: {
        type: String
    },
    commentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comment',
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('commentReply', commentReplySchema);
