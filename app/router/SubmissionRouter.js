
const express = require("express");
const router = express.Router();
const wrapAsync = require("../helper/wrapAsync");
const authenticationCheck = require("../middleware/AuthenticationCheck");
const { uploadOtherFile } = require("../helper/fileUpload");
const SubmissionController = require("../controller/SubmissionController");


//create submission
router.post("/create/submission/:assignmentId",
    authenticationCheck,
    uploadOtherFile.single("submissionFile"),
    wrapAsync(SubmissionController.createSubmission)
);

//view submission
router.get("/view/all-submission",
    authenticationCheck,
    wrapAsync(SubmissionController.viewSubmission)
);

//view single submission
router.get("/view/submission/:submissionId",
    authenticationCheck,
    wrapAsync(SubmissionController.viewIndividualSubmission)
);

//delete submission
router.delete("/delete/submission/:submissionId",
    authenticationCheck,
    wrapAsync(SubmissionController.deleteSubmission)
);

module.exports = router;