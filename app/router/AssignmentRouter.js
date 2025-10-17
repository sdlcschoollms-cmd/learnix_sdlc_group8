
const express = require("express");
const router = express.Router();
const wrapAsync = require("../helper/wrapAsync");
const authenticationCheck = require("../middleware/AuthenticationCheck");
const { uploadOtherFile } = require("../helper/fileUpload");
const AssignmentController = require("../controller/AssignmentController");


//create assignment
router.post("/create/assignment/:courseId",
    authenticationCheck,
    uploadOtherFile.single("assignmentFile"),
    wrapAsync(AssignmentController.createAssignment)
);

//view assignment
router.get("/view/all-assignment",
    authenticationCheck,
    wrapAsync(AssignmentController.viewAssignment)
);

//view single assignment
router.get("/view/assignment/:assignmentId",
    authenticationCheck,
    wrapAsync(AssignmentController.viewSingleAssignment)
);

//update assignment
router.patch("/update/:courseId/assignment/:assignmentId",
    authenticationCheck,
    uploadOtherFile.single("assignmentFile"),
    wrapAsync(AssignmentController.updateAssignment)
);

//delete assignment
router.delete("/delete/assignment/:assignmentId",
    authenticationCheck,
    wrapAsync(AssignmentController.deleteAssignment)
);

module.exports = router;