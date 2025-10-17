
const mongoose = require('mongoose');


// Defining Schema
const UserSchema = new mongoose.Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    image: {
        url: {
            type: String,
            required: true
        },
        imageId: {
            type: String,
            required: true
        }
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    role: {
        type: String
    },
    studentClass: {
        type: String
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);