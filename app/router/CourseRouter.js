
const express = require("express");
const router = express.Router();
const wrapAsync = require("../helper/wrapAsync");
const authenticationCheck = require("../middleware/AuthenticationCheck");
const CourseController = require("../controller/CourseController");
const { uploadImage } = require("../helper/fileUpload");


//create course
router.post("/create/course",
    authenticationCheck,
    uploadImage.single("image"),
    wrapAsync(CourseController.createCourse)
);

//view course
router.get("/view/all-course",
    wrapAsync(CourseController.viewCourse)
);

//view individual course
router.get("/view/course/:courseId",
    wrapAsync(CourseController.viewSingleCourse)
);

//update course
router.patch("/update/course/:id",
    authenticationCheck,
    uploadImage.single("image"),
    wrapAsync(CourseController.updateCourse)
);

//delete course
router.delete("/delete/course/:id",
    authenticationCheck,
    wrapAsync(CourseController.deleteCourse)
);

module.exports = router;