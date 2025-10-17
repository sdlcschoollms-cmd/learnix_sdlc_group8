
const express = require("express");
const router = express.Router();
const wrapAsync = require("../helper/wrapAsync");
const authenticationCheck = require("../middleware/AuthenticationCheck");
const EnrollmentController = require("../controller/EnrollmentController");

//create course
router.post("/create/enrollment",
    authenticationCheck,
    wrapAsync(EnrollmentController.createEnrollment)
);

//view course
router.get("/view/enrollment",
    authenticationCheck,
    wrapAsync(EnrollmentController.viewEnrollment)
);

module.exports = router;