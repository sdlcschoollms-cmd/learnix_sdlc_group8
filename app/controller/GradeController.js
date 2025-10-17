
const GradeModel = require("../model/GradeModel");
const EnrollmentModel = require("../model/EnrollmentModel");
const SubmissionModel = require("../model/SubmissionModel");
const CourseModel = require("../model/CourseModel");
const roles = require("../helper/roles");

class GradeController {
    //create grade
    async createGrade(req, res) {
        const { marks } = req.body;
        const userRole = req.user.role;
        const rolePermission = roles[userRole]?.grade;

        if (!rolePermission || !rolePermission.create) {
            return res.status(403).json({
                message: "Access Denied: You are not authorized to perform this operation !"
            });
        }

        const existingSubmission = await SubmissionModel.findById(req.params.submissionId)
            .populate({ path: "assignmentId", select: "assignedBy" });
        if (!existingSubmission) {
            return res.status(404).json({
                message: "No submission found"
            });
        }

        const existingGrade = await GradeModel.findOne({ studentId: existingSubmission.studentId, submissionId: existingSubmission._id });
        if (existingGrade) {
            return res.status(409).json({
                message: "Grade assigned already to this submission"
            });
        }

        if (rolePermission.create === "all" || (rolePermission.create === "team" && existingSubmission.assignmentId.assignedBy.equals(req.user._id))) {
            let gradeObtained = "";
            if (marks >= 80 && marks <= 100) {
                gradeObtained = "A";
            } else if (marks >= 60) {
                gradeObtained = "B";
            } else if (marks >= 40) {
                gradeObtained = "C"
            } else if (marks >= 25) {
                gradeObtained = "D"
            } else if (marks >= 0 && marks <= 24) {
                gradeObtained = "F"
            } else {
                return res.status(400).json({
                    message: "Invalid marks"
                });
            }
            const newGrade = await new GradeModel({
                studentId: existingSubmission.studentId,
                teacherId: req.user._id,
                submissionId: existingSubmission._id,
                marks,
                grade: gradeObtained
            }).save();

            return res.status(201).json({
                message: "Grade created successfully",
                data: newGrade
            });
        } else {
            return res.status(403).json({
                message: "You are not authorized to assign grade to this submission"
            });
        }
    }

    //view all grades
    async viewAllGrade(req, res) {
        const userRole = req.user.role;
        const rolePermission = roles[userRole]?.grade;
        if (!rolePermission || !rolePermission.view) {
            return res.status(403).json({
                message: "Access Denied: You are not authorized to perform this operation !"
            });
        }

        if (rolePermission.view === "all") {
            const existingGrades = await GradeModel.find({})
                .populate({ path: "studentId" })
                .populate({ path: "teacherId" })
                .populate({ path: "submissionId", populate: { path: "assignmentId" } });

            return res.status(200).json({
                message: "Data fetch successfully",
                data: existingGrades
            });
        }
        else if (rolePermission.view === "team") {
            const existingGrades = await GradeModel.find({ teacherId: req.user._id })
                .populate({ path: "studentId" })
                .populate({ path: "teacherId" })
                .populate({ path: "submissionId", populate: { path: "assignmentId" } });

            return res.status(200).json({
                message: "Data fetch successfully",
                data: existingGrades
            });
        }
        else if (rolePermission.view === "own") {
            const existingGrades = await GradeModel.find({ studentId: req.user._id })
                .populate({ path: "studentId" })
                .populate({ path: "teacherId" })
                .populate({ path: "submissionId", populate: { path: "assignmentId" } });

            return res.status(200).json({
                message: "Data fetch successfully",
                data: existingGrades
            });
        }
        else {
            return res.status(403).json({
                message: "You are not authorized to view grades"
            });
        }

    }
    //view single grades
    async viewSinglelGrade(req, res) {
        const userRole = req.user.role;
        const rolePermission = roles[userRole]?.grade;
        if (!rolePermission || !rolePermission.view) {
            return res.status(403).json({
                message: "Access Denied: You are not authorized to perform this operation !"
            });
        }

        const existingGrade = await GradeModel.findById(req.params.gradeId)
            .populate({ path: "studentId" })
            .populate({ path: "teacherId" })
            .populate({ path: "submissionId", populate: { path: "assignmentId" } });

        if (!existingGrade) {
            return res.status(404).json({
                message: "No grade found"
            });
        }

        if (rolePermission.view === "all" || (rolePermission.view === "team" && existingGrade.teacherId.equals(req.params._id)) || (rolePermission.view === "own" && existingGrade.studentId.equals(req.user._id))) {
            return res.status(200).json({
                message: "Data fetch successfully",
                data: existingGrade
            });
        }
        else {
            return res.status(403).json({
                message: "You are not authorized to view this grade"
            });
        }

    }

    //update grade
    async updateGrade(req, res) {
        const { marks } = req.body;
        const userRole = req.user.role;
        const rolePermission = roles[userRole]?.attendance;

        if (!rolePermission || !rolePermission.update) {
            return res.status(403).json({
                message: "Acces Denied: You are not authorized to perform this operation !"
            });
        }

        const existingGrade = await GradeModel.findById(req.params.gradeId);
        if (!existingGrade) {
            return res.status(404).json({
                message: "No grade found"
            });
        }

        if (rolePermission.update === "all" || (rolePermission.update === "team" && existingGrade.teacherId.equals(req.user._id))) {
            let gradeObtained = "";
            if (marks >= 80 && marks <= 100) {
                gradeObtained = "A";
            } else if (marks >= 60) {
                gradeObtained = "B";
            } else if (marks >= 40) {
                gradeObtained = "C"
            } else if (marks >= 25) {
                gradeObtained = "D"
            } else if (marks >= 0 && marks <= 24) {
                gradeObtained = "F"
            } else {
                return res.status(400).json({
                    message: "Invalid marks"
                });
            }
            existingGrade.marks = marks;
            const updatedGrade = await existingGrade.save();
            return res.status(200).json({
                message: "Grade updated successfully",
                data: updatedGrade
            });
        }
    }

    //delete grade
    async deleteGrade(req, res) {
        const { marks } = req.body;
        const userRole = req.user.role;
        const rolePermission = roles[userRole]?.attendance;

        if (!rolePermission || !rolePermission.update) {
            return res.status(403).json({
                message: "Acces Denied: You are not authorized to perform this operation !"
            });
        }

        const existingGrade = await GradeModel.findById(req.params.gradeId);
        if (!existingGrade) {
            return res.status(404).json({
                message: "No grade found"
            });
        }

       if(rolePermission.delete === "all" || (rolePermission.delete === "team" && existingGrade.teacherId.equals(req.user._id))) {
        const deletedGrade = await GradeModel.findByIdAndDelete(req.params.gradeId);
        return res.status(200).json({
            message: "Grade deleted successfully",
            data: deletedGrade
        });
       }
    }
}


module.exports = new GradeController();