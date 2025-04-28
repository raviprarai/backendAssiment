const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    title: {
        type: String
    },
    description: {
        type: String
    },
    blogImage : {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('blog', blogSchema);
