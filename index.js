
//++++++++++++++++++++  Importing required Files  ++++++++++++++++++++++++++
require("dotenv").config();
const express = require("express");
const dbCon = require("./app/config/dbConnection");
const path = require("path");
const cookieParser = require("cookie-parser");


//++++++++++++++++++++++++  Executing required functions  +++++++++++++++++++++++++++
const app = express();
dbCon();


// //Set view engine to EJS
// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname,"views"));


//+++++++++++++++++++++  Parsing data ++++++++++++++++++++++++++++++
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());


//++++++++++++++++++++++  Serve Static Files  +++++++++++++++++++++++++++
app.use(express.static(path.join(__dirname,"uploads")));
app.use(express.static(path.join(__dirname,"public")));


//+++++++++++++++++++++++  Using routes  ++++++++++++++++++++++++++
//User router
const UserRouter = require("./app/router/UserRouter");
app.use(UserRouter);

//Course Router
const CourseRouter = require("./app/router/CourseRouter");
app.use(CourseRouter);

//Review Router
const ReviewRouter = require("./app/router/ReviewRouter");
app.use(ReviewRouter);

//Enrollment router
const EnrollmentRouter = require("./app/router/EnrollmentRoute");
app.use(EnrollmentRouter);

//Assignment router
const AssignmentRouter = require("./app/router/AssignmentRouter");
app.use(AssignmentRouter);

//Submission router
const Submissionrouter = require("./app/router/SubmissionRouter");
app.use(Submissionrouter);

//Grade router
const GradeRouter = require("./app/router/GradeRouter");
app.use(GradeRouter);

//Attendance router
const AttendanceRouter = require("./app/router/AttendanceRouter");
app.use(AttendanceRouter);


//++++++++++++++++++++++++  Basic error handling  ++++++++++++++++++++++++++
const handlingErrors = require("./app/middleware/HandlingErrors");
app.use(handlingErrors);


//+++++++++++++++++  Creating Server  ++++++++++++++++++++++
const port = 8080;

app.listen(port, ()=>{
    console.log(`Server started at ${port}`);
});