
const EnrollmentModel = require("../model/EnrollmentModel");
const CourseModel = require("../model/CourseModel");
const { roles } = require("../helper/roles");

class EnrollmentController {

    //create enrollments
    async createEnrollment(req, res) {
        const userRole = req.user.role;
        const rolePermission = roles[userRole]?.enrollment;
        const { fullName, phone, dob, gender, courseType } = req.body;
        // Validate input
        if (!fullName || !phone || !dob || !courseType) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }
        if (!rolePermission || !rolePermission.create) {
            return res.status(403).json({
                message: "You are not permitted for enrollments"
            });
        }
        const existingCourse = await CourseModel.findOne({ title: courseType });
        if (!existingCourse) {
            return res.status(404).json({
                message: "Course does not exists"
            });
        }
        const alreadyEnrolled = await EnrollmentModel.findOne({
            courseId: existingCourse._id,
            studentId: req.user._id
        });

        if (alreadyEnrolled) {
            return res.status(400).json({
                message: "You have already enrolled in this course"
            });
        }

        const enrolled = await new EnrollmentModel({
            courseId: existingCourse._id,
            studentId: req.user._id,
            fullName,
            phone,
            courseType,
            gender,
            dob
        }).save();
        return res.status(201).json({
            message: "Enrolled in the course successfully",
            data: enrolled
        });
    }

    //view enrollments
    async viewEnrollment(req, res) {
        const userRole = req.user.role;
        const rolePermission = roles[userRole]?.enrollment;

        if (!rolePermission || !rolePermission.view) {
            return res.status(403).json({
                message: "Your are not authorized"
            });
        }

        if (rolePermission.view === "all") {
            const allEnrollment = await EnrollmentModel.find({})
                .populate({ path: "studentId" })
                .populate({ path: "courseId" });
            return res.status(200).json({
                message: "Data fetch successfully",
                data: allEnrollment
            });
        } else if (rolePermission.view === "own") {
            const ownEnrollment = await EnrollmentModel
                .find({ studentId: req.user._id })
                .populate({ path: "studentId" })
                .populate({ path: "courseId" });
            if (ownEnrollment.length === 0) {
                return res.status(404).json({
                    message: "you have not enrolled on any courses"
                });
            }
            return res.status(200).json({
                message: "Data fetch successfully",
                data: ownEnrollment
            });
        } else {
            return res.status(403).json({
                message: "You are not permitted to view enrollments"
            });
        }
    }

}

module.exports = new EnrollmentController();