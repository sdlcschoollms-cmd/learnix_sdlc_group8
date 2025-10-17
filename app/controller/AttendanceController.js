
const AttendanceModel = require("../model/AttendanceModel");
const EnrollmentModel = require("../model/EnrollmentModel");
const CourseModel = require("../model/CourseModel");
const {roles} = require("../helper/roles");

class AttendanceController {
    //create attendance
    async createAttendance(req, res) {
        const { studentId, status, date } = req.body;
        const userRole = req.user.role;
        const rolePermission = roles[userRole]?.attendance;

        if (!rolePermission || !rolePermission.create) {
            return res.status(403).json({
                message: "Acces Denied: You are not authorized to perform this operation !"
            });
        }
        if (!date) {
            return res.status(400).json({
                message: "Forbidden: Please specify the date !"
            });
        }
        const existingCourse = await CourseModel.findById(req.params.courseId);
        if (!existingCourse) {
            return res.status(404).json({
                message: "No course found"
            });
        }
        const enrolledStudent = await EnrollmentModel.findOne({ courseId: existingCourse._id, studentId: studentId });
        if (!enrolledStudent) {
            return res.status(400).json({
                message: "Student is not enrolled in this course"
            });
        }

        let newDate = new Date(date);
        const startOfDay = new Date(newDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(newDate.setHours(23, 59, 59, 999));

        const existingAttendance = await AttendanceModel.findOne({ courseId: existingCourse._id, studentId: studentId, date: { $gte: startOfDay, $lte: endOfDay }});

        if(existingAttendance) {
            return res.status(409).json({
                message: "Attendance already given"
            });
        }

        const newAttendance = await new AttendanceModel({
            courseId: existingCourse._id,
            teacherId: req.user._id,
            studentId,
            status,
            date: newDate
        }).save();

        return res.status(201).json({
            message: "Attendance created successfully",
            data: newAttendance
        });
    }

    //view attendance
    async viewAttendance(req, res) {
        const userRole = req.user.role;
        const rolePermission = roles[userRole]?.attendance;
        if (!rolePermission || !rolePermission.view) {
            return res.status(403).json({
                message: "Acces Denied: You are not authorized to perform this operation !"
            });
        }

        const existingCourse = await CourseModel.findById(req.params.courseId);
        if (!existingCourse) {
            return res.status(404).json({
                message: "No course found"
            });
        }

        if (rolePermission.view === "own") {
            const ownAttendance = await AttendanceModel.find({
                courseId: existingCourse._id,
                studentId: req.user._id,
            }).populate({ path: "studentId", select: "firstName lastName email" })
                .populate({ path: "courseId", select: "title" });

            return res.status(200).json({
                message: "Data fetch successfully",
                length: ownAttendance.length,
                data: ownAttendance
            });
        }

        //making variable for date check
        const { date } = req.query;  // e.g. 2025-10-14
        if (!date) {
            return res.status(400).json({
                message: "Forbidden: Please specify the date !"
            });
        }
        const selectedDate = new Date(date);
        const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

        if (rolePermission.view === "all") {
            const allAttendance = await AttendanceModel.find({
                courseId: existingCourse._id,
                date: { $gte: startOfDay, $lte: endOfDay }
            }).populate({ path: "studentId", select: "firstName lastName email" })
                .populate({ path: "courseId", select: "title" })
                .populate({ path: "teacherId", select: "firstName lastName email" });

            return res.status(200).json({
                message: "Data fetch successfully",
                length: allAttendance.length,
                data: allAttendance
            });
        }else {
            return res.status(403).json({
                message: "You are not authorized to view attendance list"
            });
        }
    }

    //update attendance
    async updateAttendance(req, res) {
        const { studentId, status, date } = req.body;
        if(!studentId || !status || !date) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }
        const userRole = req.user.role;
        const rolePermission = roles[userRole]?.attendance;

        if (!rolePermission || !rolePermission.update) {
            return res.status(403).json({
                message: "Acces Denied: You are not authorized to perform this operation !"
            });
        }

        const existingCourse = await CourseModel.findById(req.params.courseId);
        if (!existingCourse) {
            return res.status(404).json({
                message: "No course found"
            });
        }
        const enrolledStudent = await EnrollmentModel.findOne({ courseId: existingCourse._id, studentId: studentId });
        if (!enrolledStudent) {
            return res.status(400).json({
                message: "Student is not enrolled in this course"
            });
        }

        const updatedDate = new Date(date);
        const existingAttendance = await AttendanceModel.findById(req.params.attendanceId);
        if(!existingAttendance) {
            return res.status(404).json({
                message: "No attendance data found"
            });
        }

        if(rolePermission.update === "all") {
            existingAttendance.studentId = studentId;
            existingAttendance.status = status;
            existingAttendance.date = updatedDate;
        } else if(rolePermission.update === "team" && existingAttendance.teacherId.equals(req.user._id)) {
            existingAttendance.studentId = studentId;
            existingAttendance.status = status;
            existingAttendance.date = updatedDate;
        } else {
            return res.status(403).json({
                message: "You are not authorized to perform this operation"
            });
        }

        const updatedAttendance = await existingAttendance.save();
        return res.status(200).json({
            message: "Attendance updated successfully",
            data: updatedAttendance
        });
    }
}


module.exports = new AttendanceController();