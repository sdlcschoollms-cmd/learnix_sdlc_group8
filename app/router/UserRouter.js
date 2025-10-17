
const express = require("express");
const router = express.Router();
const wrapAsync = require("../helper/wrapAsync");
const UserController = require("../controller/UserController");
const authenticationCheck = require("../middleware/AuthenticationCheck");
const { uploadImage } = require("../helper/fileUpload");


//Register User
router.post("/auth/register",
    uploadImage.single("image"),
    wrapAsync(UserController.registerUser));

//Login User
router.post("/auth/login",
    wrapAsync(UserController.loginUser));

//Users Dashboard(Testing purpose)
router.get("/auth/dashboard",
    authenticationCheck,
    wrapAsync(UserController.dashboard));

//Get all users
router.get("/auth/users",
    authenticationCheck,
    wrapAsync(UserController.allusers)
);

//update user profile photo
router.patch("/auth/update/profile/:id",
    authenticationCheck,
    uploadImage.single("image"),
    wrapAsync(UserController.updateUser)
);

//Delete user
router.delete("/auth/delete/user/:id",
    authenticationCheck,
    wrapAsync(UserController.deleteUser)
);

//Logout User
router.post("/auth/logout",
    authenticationCheck,
    wrapAsync(UserController.logout)
);

//Refresh accessToken
router.post("/auth/refresh",
    authenticationCheck,
    wrapAsync(UserController.refreshAccessToken)
);

//Password reset link
router.post('/account/reset-password-link',
    wrapAsync(UserController.resetPasswordLink)
);

//Reset Password
router.post('/account/reset-password/:id/:token',
    wrapAsync(UserController.resetPassword)
);

module.exports = router;