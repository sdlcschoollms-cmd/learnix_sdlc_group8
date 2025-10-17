
const ReviewModel = require("../model/CourseReviewModel");
const CourseModel = require("../model/CourseModel");
const { roles } = require("../helper/roles");
const mongoose = require("mongoose");

class ReviewController {
    //Posting reviews
    async postReview(req, res) {

        //Checking for valid id
        if (!(mongoose.Types.ObjectId.isValid(req.params.courseId))) {
            return res.status(404).json({
                message: "Invalid course id"
            });
        }

        //cheking for course
        const existingCourse = await CourseModel.findById(req.params.courseId);
        if (!existingCourse) {
            return res.status(404).json({
                message: "No course found"
            });
        }

        const { comment, rating } = req.body;
        let newReview = await new ReviewModel({
            courseId: existingCourse._id,
            ownerId: req.user._id,
            comment,
            rating
        }).save();

        return res.status(201).json({
            message: "Review created successfully",
            data: newReview
        });
    }

    //get all reviews
    async allReview(req, res) {
        const existingCourse = await CourseModel.findById(req.params.courseId);
        if(!existingCourse) {
            return res.status(404).json({
                message: "Course not found"
            });
        }
        const existingReviews = await ReviewModel.find({ courseId: req.params.courseId })
        .populate({ path: "studentId", select: "firstName lastName"});
        return res.status(200).json({
            message: "Reviews fetched successfully",
            data: existingReviews
        });
    }

    //update Review
    async updatereview(req, res) {
        const existingReview = await ReviewModel.findById(req.params.reviewId);
        if (existingReview.ownerId.equals(req.user._id)) {
            const updatedReview = await ReviewModel.findByIdAndUpdate(req.params.reviewId, req.body, { new: true });
            return res.status(200).json({
                message: "Review updated successfully",
                data: updatedReview
            });
        } else {
            return res.status(403).json({
                message: "You are not the owner of this review"
            });
        }
    }

    //Delete review
    async deleteReview(req, res) {
        const userRole = req.user.role;
        const rolePermission = roles[userRole]?.review;
        if (!rolePermission || !rolePermission.delete) {
            return res.status(403).json({
                message: "you are not permitted to delete reviews"
            });
        }
        const { reviewId } = req.params;
        const existingReview = await ReviewModel.findById(reviewId).populate("ownerId");
        if (rolePermission.delete === "all") {
            await ReviewModel.findByIdAndDelete(reviewId);
        }
        if (rolePermission.delete === "own" && existingReview.ownerId._id.equals(req.user._id)) {
            await ReviewModel.findByIdAndDelete(reviewId);
        } else {
            return res.status(403).json({
                message: "you are not the owner of this review"
            });
        }

        return res.status(200).json({
            message: "Review deleted successfully"
        });
    }
}

module.exports = new ReviewController();