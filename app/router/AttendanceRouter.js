
const express = require("express");
const router = express.Router();
const wrapAsync = require("../helper/wrapAsync");
const authenticationCheck = require("../middleware/AuthenticationCheck");
const AttendanceController = require("../controller/AttendanceController");

//create attendance
router.post("/create/attendance/:courseId",
    authenticationCheck,
    wrapAsync(AttendanceController.createAttendance)
);

//view attendance
router.get("/view/attendance/:courseId",
    authenticationCheck,
    wrapAsync(AttendanceController.viewAttendance)
);
//update attendance
router.patch("/update/attendance/:courseId/:attendanceId",
    authenticationCheck,
    wrapAsync(AttendanceController.updateAttendance)
);

module.exports = router;