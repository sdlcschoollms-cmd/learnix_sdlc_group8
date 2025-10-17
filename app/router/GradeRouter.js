
const express = require("express");
const router = express.Router();
const wrapAsync = require("../helper/wrapAsync");
const authenticationCheck = require("../middleware/AuthenticationCheck");
const GradeController = require("../controller/GradeController");

//create grade
router.post("/create/grade/:submissionId",
    authenticationCheck,
    wrapAsync(GradeController.createGrade)
);

//view all grade
router.get("/view/all-grade",
    authenticationCheck,
    wrapAsync(GradeController.viewAllGrade)
);

//view single grade
router.get("/view/grade/:gradeId",
    authenticationCheck,
    wrapAsync(GradeController.viewSinglelGrade)
);

//update grade
router.patch("/update/grade/:gradeId",
    authenticationCheck,
    wrapAsync(GradeController.updateGrade)
);

//delete grade
router.delete("/delete/grade/:gradeId",
    authenticationCheck,
    wrapAsync(GradeController.updateGrade)
);

module.exports = router;