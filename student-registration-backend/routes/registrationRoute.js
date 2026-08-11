const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    registerCourse,
    dropCourse,
    getStudentCourses
} = require("../controllers/registrationController");


// Register student for course
router.post(
    "/",
    authMiddleware,
    registerCourse
);

// Drop Course

router.delete(
    "/:id",
    authMiddleware,
    dropCourse
);

// Get Student Registered Courses

router.get(
    "/student/:student_id",
    authMiddleware,
    getStudentCourses
);


module.exports = router;