
const multer = require("multer");
const { storage } = require("../helper/cloudFileUpload");

// module.exports = multer({ storage });

const uploadImage = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpg", "image/jpeg", "image/png"]
        if(allowed.includes(file.mimetype)) {
            cb(null, true);
        }else {
            cb(new Error("Only image files are allowed"), false);
        }
    }
});

const uploadOtherFile = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowed = ["application/pdf"]
        if(allowed.includes(file.mimetype)) {
            cb(null, true);
        }else {
            cb(new Error("Only pdf files are allowed"), false);
        }
    }
});

module.exports = { uploadImage, uploadOtherFile };