
const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    assignedTo: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    ],
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    dueDate: {
        type: String,
        required: true
    },
    assignmentFile: {
        url: {
            type: String,
            required: true
        },
        assignmentFileId: {
            type: String,
            required: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

AssignmentSchema.index({ courseId: 1, title: 1 }, { unique: true });

module.exports = mongoose.model("Assignment", AssignmentSchema);