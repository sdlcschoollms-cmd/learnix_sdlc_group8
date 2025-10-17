
const AssignmentModel = require("../model/AsignmentModel");
const CourseModel = require("../model/CourseModel");
const EnrollmentModel = require("../model/EnrollmentModel");
const { roles } = require("../helper/roles");
const { cloudinary } = require("../helper/cloudFileUpload");

class AssignmentController {
    async createAssignment(req, res) {
        const { assignedTo, title, description, dueDate } = req.body;
        const userRole = req.user.role;
        const rolePermission = roles[userRole]?.assignment;

        if (!rolePermission || !rolePermission.create) {
            if (req.file) {
                await cloudinary.uploader.destroy(req.file.filename);
            }
            return res.status(403).json({
                message: "You are not authorized to create assignment"
            });
        }

        const existingCourse = await CourseModel.findById(req.params.courseId);
        if (!existingCourse) {
            if (req.file) {
                await cloudinary.uploader.destroy(req.file.filename);
            }
            return res.status(404).json({
                message: "Course does not exists"
            });
        }

        const existingAssignment = await AssignmentModel.findOne({ courseId: existingCourse._id, title: title });
        if (existingAssignment) {
            if (req.file) {
                await cloudinary.uploader.destroy(req.file.filename);
            }
            return res.status(409).json({
                message: "Assignment already exists"
            });
        }
        const assignedToArray = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
        // const existingAssignmentStudent = await AssignmentModel.findOne({ courseId: existingCourse._id, assignedTo: { $in: assignedToArray } });
        // if (existingAssignmentStudent) {
        //     if (req.file) {
        //         await cloudinary.uploader.destroy(req.file.filename);
        //     }
        //     return res.status(409).json({
        //         message: "student is already assigned"
        //     });
        // }

        const createdAssignment = new AssignmentModel({
            courseId: existingCourse._id,
            assignedBy: req.user._id,
            title,
            description,
            dueDate
        });

        const enrolledStudents = await EnrollmentModel.find({ courseId: existingCourse._id, studentId: { $in: assignedToArray } });
        const enrolledIds = enrolledStudents.flatMap((val) => val.studentId.toString());
        const notEnrolled = assignedToArray.filter((val) => !enrolledIds.includes(val.toString()));
        if (notEnrolled.length > 0) {
            if (req.file) {
                await cloudinary.uploader.destroy(req.file.filename);
            }
            return res.status(400).json({
                message: "few students are not enrolled in this course",
                data: notEnrolled
            });
        }
        createdAssignment.assignedTo = assignedTo;
        if (!req.file) {
            return res.status(400).json({
                message: "File is required"
            })
        } else {
            createdAssignment.assignmentFile.url = req.file.path;
            createdAssignment.assignmentFile.assignmentFileId = req.file.filename;
        }

        const newAssignment = await createdAssignment.save();
        return res.status(201).json({
            message: "Assignment created successfully",
            data: newAssignment
        });
    }

    //view assignment
    async viewAssignment(req, res) {
        const userRole = req.user.role;
        const rolePermission = roles[userRole]?.assignment;
        if (!rolePermission || !rolePermission.view) {
            return res.status(403).json({
                message: "You are not authorized to perform this operation"
            });
        }
        const allAssignment = await AssignmentModel.find({})
            .populate({ path: "assignedTo" })
            .populate({ path: "assignedBy" })
            .populate({ path: "courseId" });

        if (rolePermission.view === "all") {
            return res.status(200).json({
                message: "Data fetch successfully",
                data: allAssignment
            });
        } else if (rolePermission.view === "team") {
            const assignedAssignments = await AssignmentModel.find({ assignedBy: req.user._id })
            .populate({ path: "assignedTo" })
            .populate({ path: "courseId" });
            return res.status(200).json({
                message: "Data fetch successfully",
                data: assignedAssignments
            });
        } else if (rolePermission.view === "own") {
            const ownAssignments = await AssignmentModel.find({ assignedTo: req.user._id })
            .populate({ path: "assignedBy" })
            .populate({ path: "courseId" });
            return res.status(200).json({
                message: "Data fetch successfully",
                data: ownAssignments
            });
        } else {
            return res.status(403).json({
                message: "You are not authorized to view assignments"
            });
        }
    }

    //view individual assignment
    async viewSingleAssignment(req, res) {
        const userRole = req.user.role;
        const rolePermission = roles[userRole]?.assignment;
        if (!rolePermission || !rolePermission.view) {
            return res.status(403).json({
                message: "You are not authorized to perform this operation"
            });
        }
        const existingAssignment = await AssignmentModel.findById(req.params.assignmentId)
            .populate({ path: "assignedTo" })
            .populate({ path: "assignedBy" })
            .populate({ path: "courseId" });

            if(!existingAssignment) {
                return res.status(404).json({
                    message: "No assignment found"
                });
            }
        if (rolePermission.view === "all" || (rolePermission.view === "team" && existingAssignment.assignedBy.equals(req.user._id)) || (rolePermission.view === "own" && existingAssignment.assignedTo.some((id) => id.equals(req.user._id)))) {
            return res.status(200).json({
                message: "Data fetch successfully",
                data: existingAssignment
            });
        } else {
            return res.status(403).json({
                message: "You are not authorized to view assignment"
            });
        }
    }

    //update assignments
    async updateAssignment(req, res) {
        const userRole = req.user.role;
        const rolePermission = roles[userRole]?.assignment;
        let updates = {};
        for (let key in req.body) {
            if (req.body[key] !== undefined && req.body[key] !== "") {
                updates[key] = req.body[key];
            }
        }
        if (!rolePermission) {
            return res.status(403).json({
                message: "You are not authorized to perform this operation"
            });
        }

        const existingCourse = await CourseModel.findById(req.params.courseId);
        if (!existingCourse) {
            if (req.file) {
                await cloudinary.uploader.destroy(req.file.filename);
            }
            return res.status(404).json({
                message: "Course does not exists"
            });
        }

        const existingAssignment = await AssignmentModel.findById(req.params.assignmentId);
        if (!existingAssignment) {
            if (req.file) {
                await cloudinary.uploader.destroy(req.file.filename);
            }
            return res.status(404).json({
                message: "No assignment found"
            });
        }

        const assignedToArray = Array.isArray(req.body.assignedTo) ? req.body.assignedTo : [req.body.assignedTo];
        const existingEnrolledStudents = await EnrollmentModel.find({
            courseId: existingCourse._id,
            studentId: { $in: assignedToArray }
        });
        if (existingEnrolledStudents.length === 0) {
            if (req.file) {
                await cloudinary.uploader.destroy(req.file.filename);
            }
            return res.status(404).json({
                message: "selected students have not enrolled in this course"
            });
        }
        const studentIds = existingEnrolledStudents.map((val) => val.studentId.toString());
        const notEnrolledIds = assignedToArray.filter((val) => !studentIds.includes(val.toString()));

        if (notEnrolledIds.length > 0) {
            if (req.file) {
                await cloudinary.uploader.destroy(req.file.filename);
            }
            return res.status(400).json({
                message: "Some students are not enrolled in this course",
                data: notEnrolledIds
            });
        }

        if (rolePermission.update === "all") {
            Object.assign(existingAssignment, updates);
        } else if (rolePermission.update === "team" && existingAssignment.assignedBy.equals(req.user._id)) {
            Object.assign(existingAssignment, updates);
        } else {
            if (req.file) {
                await cloudinary.uploader.destroy(req.file.filename);
            }
            return res.status(403).json({
                message: "You are not authorized to perform this operation"
            });
        }

        if (req.file) {
            if (existingAssignment.assignmentFile) {
                await cloudinary.uploader.destroy(existingAssignment.assignmentFile.assignmentFileId);
            }
            existingAssignment.assignmentFile = {
                url: req.file.path,
                assignmentFileId: req.file.filename
            }
        }

        // existingAssignment.assignedTo = assignedTo; // i need to assign manually because i desturcture it in the begining
        await existingAssignment.save();

        return res.status(200).json({
            message: "assignment updated successfully",
            data: existingAssignment
        });
    }

    //delete assignments
    async deleteAssignment(req, res) {
        const userRole = req.user.role;
        const rolePermission = roles[userRole]?.assignment;

        if (!rolePermission) {
            return res.status(403).json({
                message: "You are not authorized to perform this operation"
            });
        }

        const existingAssignment = await AssignmentModel.findById(req.params.assignmentId);
        if (!existingAssignment) {
            return res.status(404).json({
                message: "No assignment found"
            });
        }
        if (rolePermission.delete === "all") {
            if (existingAssignment.assignmentFile) {
                await cloudinary.uploader.destroy(existingAssignment.assignmentFile.assignmentFileId);
            }
            await existingAssignment.deleteOne();
        } else if (rolePermission.delete === "team" && existingAssignment.assignedBy.equals(req.user._id)) {
            if (existingAssignment.assignmentFile) {
                await cloudinary.uploader.destroy(existingAssignment.assignmentFile.assignmentFileId);
            }
            await existingAssignment.deleteOne();
        } else {
            return res.status(403).json({
                message: "Denied!! You are not the author of this assignment !"
            });
        }

        return res.status(200).json({
            message: "assignment deleted successfully"
        });
    }
}


module.exports = new AssignmentController();