
const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema({
    assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment",
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    submissionFile: {
        url: {
            type: String,
            required: true
        },
        submissionFileId: {
            type: String,
            required: true
        }
    },
    submittedOn: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Submission", SubmissionSchema);