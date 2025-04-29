const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String
    },
    profileImage : {
        type: String
    },
    isUser: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
