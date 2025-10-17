const mongoose = require("mongoose");

const CourseSchema = mongoose.Schema({
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
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
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    subjects: [
        {
            type: String,
            required: true
        }
    ],
    skillLevel: {
        type: String,
        required: true,
        enum: ["Beginner","Intermediate","Advance"]
    },
    certificate: {
        type: String,
        required: true,
        enum: ["Yes", "No"]
    },
    approved: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Course", CourseSchema);