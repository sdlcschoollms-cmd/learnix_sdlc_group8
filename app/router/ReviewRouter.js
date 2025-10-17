
const express = require("express");
const router = express.Router();
const wrapAsync = require("../helper/wrapAsync");
const authenticationCheck = require("../middleware/AuthenticationCheck");
const ReviewController = require("../controller/ReviewController");


//create review
router.post("/create/review/:courseId",
    authenticationCheck,
    wrapAsync(ReviewController.postReview)
);

//view review
router.get("/view/all-review/:courseId",
    wrapAsync(ReviewController.allReview)
);

//update review
router.patch("/update/review/:reviewId",
    authenticationCheck,
    wrapAsync(ReviewController.updatereview)
);

//delete review
router.delete("/delete/review/:reviewId",
    authenticationCheck,
    wrapAsync(ReviewController.deleteReview)
);

module.exports = router;