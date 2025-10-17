
const SubmissionModel = require("../model/SubmissionModel");
const AssignmentModel = require("../model/AsignmentModel");
const { cloudinary } = require("../helper/cloudFileUpload");
const { roles } = require("../helper/roles");

class SubmissionController {
    //create submission
    async createSubmission(req, res) {
        const userRole = req.user.role;
        const rolePermission = roles[userRole]?.submission;
        if (!rolePermission || !rolePermission.create) {
            if (req.file) {
                await cloudinary.uploader.destroy(req.file.filename);
            }
            return res.status(403).json({
                message: "You are not permitted to perform this operation"
            });
        }

        const { title } = req.body;

        //missing file check
        if (!req.file) {
            return res.status(400).json({
                message: "Attachtment file is required"
            });
        }

        //existing assignment check
        const existingAssignment = await AssignmentModel.findById(req.params.assignmentId);
        if (!existingAssignment) {
            if (req.file) {
                await cloudinary.uploader.destroy(req.file.filename);
            }
            return res.status(404).json({
                message: "No assignment found"
            });
        }

        //existing submission check
        const existingSubmission = await SubmissionModel.findOne({
            assignmentId: existingAssignment._id,
            studentId: req.user._id
        });
        if (existingSubmission) {
            if (req.file) {
                await cloudinary.uploader.destroy(req.file.filename);
            }
            return res.status(409).json({
                message: "Assignment already submitted"
            });
        }

        //create new submission
        const newSubmission = new SubmissionModel({
            assignmentId: existingAssignment._id,
            studentId: req.user._id,
            title
        });

        if (req.file) {
            newSubmission.submissionFile = {
                url: req.file.path,
                submissionFileId: req.file.filename
            }
        }

        await newSubmission.save();

        return res.status(201).json({
            message: "Assignment submitted successfully",
            data: newSubmission
        });
    }

    //view submission
    async viewSubmission(req, res) {
        const userRole = req.user.role;
        const rolePermission = roles[userRole]?.submission;
        if (!rolePermission || !rolePermission.view) {
            return res.status(403).json({
                message: "You are not permitted to perform this operation"
            });
        }

        if (rolePermission.view === "all") {
            const allSubmission = await SubmissionModel.find({}).populate("assignmentId studentId");
            return res.status(200).json({
                message: "Data fetch successfully",
                data: allSubmission
            });
        } else if (rolePermission.view === "team") {
            const existingAssignments = await AssignmentModel.find({ assignedBy: req.user._id });
            const existingStudentIds = existingAssignments.flatMap((val) => (val.assignedTo || []).map((id) => id.toString()));
            const teamSubmission = await SubmissionModel.find({ studentId: { $in: existingStudentIds } })
                .populate({ path: "studentId", select: "firstName lastName email" })
                .populate({ path: "assignmentId", select: "title dueDate createdAt" });
            if (teamSubmission.length === 0) {
                return res.status(404).json({
                    message: "No submission found"
                });
            }
            return res.status(200).json({
                message: "Data fetch successfully",
                data: teamSubmission
            });
        } else if (rolePermission.view === "own") {
            const existingSubmission = await SubmissionModel.find({ studentId: req.user._id })
                .populate({ path: "assignmentId", populate: { path: "assignedBy", select: "firstName lastName email"} });
            if (existingSubmission.length === 0) {
                return res.status(404).json({
                    message: "You have not submitted any assigngnment yet"
                });
            }
            return res.status(200).json({
                message: "Data fetch successfully",
                data: existingSubmission
            });
        } else {
            return res.status(403).json({
                message: "You are not permitted to view submission"
            });
        }
    }

    //view individual submission
    async viewIndividualSubmission(req, res) {
        const userRole = req.user.role;
        const rolePermission = roles[userRole]?.submission;
        if (!rolePermission || !rolePermission.view) {
            return res.status(403).json({
                message: "You are not permitted to perform this operation"
            });
        }
        const existingSubmission = await SubmissionModel.findById(req.params.submissionId)
            .populate({ path: "assignmentId", populate: { path: "assignedBy", select: "firstName lastName email" } })
            .populate("studentId", "firstName lastName email");

        if (!existingSubmission) {
            return res.status(404).json({
                message: "No submission found"
            });
        }

        if (rolePermission.view === "all" ||
            (rolePermission.view === "team" && existingSubmission.assignmentId.assignedBy._id.equals(req.user._id)) || (rolePermission.view === "own" && existingSubmission.studentId.equals(req.user._id))) {
            return res.status(200).json({
                message: "Data fetch successfully",
                data: existingSubmission
            });
        }
    }

    //delete submission
    async deleteSubmission(req, res) {
        const userRole = req.user.role;
        const rolePermission = roles[userRole]?.submission;
        if (!rolePermission || !rolePermission.delete) {
            return res.status(403).json({
                message: "You are not permitted to perform this operation"
            });
        }

        const existingSubmission = await SubmissionModel.findById(req.params.submissionId);
        if (!existingSubmission) {
            return res.status(404).json({
                message: "No submission found"
            });
        }

        if (rolePermission.delete === "all") {
            if (existingSubmission.submissionFile) {
                await cloudinary.uploader.destroy(existingSubmission.submissionFile.submissionFileId);
            }
            await existingSubmission.deleteOne();
            return res.status(200).json({
                message: "Data deleted successfully"
            });
        } else if (rolePermission.delete === "own" && existingSubmission.studentId.equals(req.user._id)) {
            if (existingSubmission.submissionFile) {
                await cloudinary.uploader.destroy(existingSubmission.submissionFile.submissionFileId);
            }
            await existingSubmission.deleteOne();
            return res.status(200).json({
                message: "Data deleted successfully"
            });
        } else {
            return res.status(403).json({
                message: "Access Denied: You are not the owner of this submission !!"
            });
        }
    }
}

module.exports = new SubmissionController();