
const CourseModel = require("../model/CourseModel");
const { roles } = require("../helper/roles");
const { cloudinary } = require("../helper/cloudFileUpload");

class CourseController {
    //create course
    async createCourse(req, res) {
        const { title, description, subjects, skillLevel, certificate } = req.body;
        const userRole = req.user.role;
        const rolePermission = roles[userRole]?.course;

        //authorize check
        if (!rolePermission || !rolePermission.create) {
            if (req.file) {
                await cloudinary.uploader.destroy(req.file.filename); // delete old image
            }
            return res.status(403).json({
                message: "You are not authorized to perform this action"
            });
        }

        const newCourse = new CourseModel({
            teacherId: req.user._id,
            title,
            description,
            subjects,
            skillLevel,
            certificate
        });

        if (req.file) {
            newCourse.image.url = req.file.path;
            newCourse.image.imageId = req.file.filename; //unique id of cloudinary helpful
        }
        await newCourse.save();

        return res.status(201).json({
            message: "Course created successfully",
            course: newCourse
        });
    }
    //view all course
    async viewCourse(req, res) {
        const allCourses = await CourseModel.find({}).populate({ path: "teacherId" });
        return res.status(200).json({
            message: "Data fethch successfully",
            total: allCourses.length,
            data: allCourses
        });
    }

    //view individual course
    async viewSingleCourse(req, res) {
        const existingCourse = await CourseModel.findById(req.params.courseId);
        if(!existingCourse) {
            return res.status(404).json({
                message: "No course found"
            });
        }
        return res.status(200).json({
            message: "Data fethch successfully",
            data: existingCourse
        });
    }

    //update course
    async updateCourse(req, res) {

        const { title, description, subjects, skillLevel, certificate } = req.body;
        const userRole = req.user.role;
        const rolePermission = roles[userRole]?.course;
        const existingCourse = await CourseModel.findById(req.params.id);

        //check authorization
        if (!rolePermission || ((rolePermission.update !== "all") && !(rolePermission.update === "own" && existingCourse.teacherId.equals(req.user._id)))) {
            if (req.file) {
                await cloudinary.uploader.destroy(req.file.filename); // delete old image
            }
            return res.status(403).json({
                message: "You are not authorized to perform this action"
            });
        }

        if (rolePermission.update === "all") {
            existingCourse.title = title || existingCourse.title;
            existingCourse.description = description || existingCourse.description;
            existingCourse.subjects = subjects || existingCourse.subjects;
            existingCourse.skillLevel = skillLevel || existingCourse.skillLevel;
            existingCourse.certificate = certificate || existingCourse.certificate;
            if (req.file) {
                if (existingCourse.image) {
                    await cloudinary.uploader.destroy(existingCourse.image.imageId); // delete old image
                }
                existingCourse.image.url = req.file.path;
                existingCourse.image.imageId = req.file.filename;
            }
        } else if (rolePermission.update === "own" && existingCourse.teacherId.equals(req.user._id)) {
            existingCourse.teacherId = req.user._id,
            existingCourse.title = title || existingCourse.title;
            existingCourse.description = description || existingCourse.description;
            existingCourse.subjects = subjects || existingCourse.subjects;
            existingCourse.skillLevel = skillLevel || existingCourse.skillLevel;
            cretificate.cretificate = cretificate || existingCourse.cretificate;
            if (req.file) {
                if (existingCourse.image) {
                    await cloudinary.uploader.destroy(existingCourse.image.imageId); // delete old image
                }
                existingCourse.image.url = req.file.path;
                existingCourse.image.imageId = req.file.filename;
            }
        } else {
            return res.status(403).json({
                message: "You are not authorized to perform this action"
            });
        }

        const updatedCourse = await existingCourse.save();
        return res.status(200).json({
            message: "Data updated successfully",
            data: updatedCourse
        });
    }
    //delete course
    async deleteCourse(req, res) {

        const userRole = req.user.role;
        const rolePermission = roles[userRole]?.course;
        const existingCourse = await CourseModel.findById(req.params.id);
        console.log("Image info:", existingCourse.image);

        //check authorization
        if (!rolePermission || !rolePermission.delete) {
            return res.status(403).json({
                message: "You are not authorized to perform this action"
            });
        }

        if (rolePermission.update === "all") {
            if (existingCourse.image) {
                await cloudinary.uploader.destroy(existingCourse.image.imageId); // delete old image
            }
            await existingCourse.deleteOne();
        } else if (rolePermission.update === "own" && existingCourse.teacherId.equals(req.user._id)) {
            if (existingCourse.image) {
                await cloudinary.uploader.destroy(existingCourse.image.imageId); // delete old image
            }
            await existingCourse.deleteOne();
        } else {
            return res.status(403).json({
                message: "You are not authorized to perform this action"
            });
        }

        return res.status(200).json({
            message: "Data deleted successfully"
        });
    }
}


module.exports = new CourseController();