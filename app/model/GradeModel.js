
const mongoose = require("mongoose");

const GradeSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    submissionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    marks: {
        type: Number,
        required: true
    },
    grade: {
        type: String,
        enum: ["A","B","C","D","F"],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    }
});

module.exports = mongoose.model("Grade", GradeSchema);