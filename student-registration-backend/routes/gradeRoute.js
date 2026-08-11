const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    assignGrade,
    getStudentGrades,
    updateGrade,
    calculateGPA
} = require("../controllers/gradeController");



// Get Student Grades

router.get(
    "/student/:id",
    authMiddleware,
    getStudentGrades
);

// Calculate Student GPA

router.get(
    "/student/:id/gpa",
    authMiddleware,
    calculateGPA
);



// Assign Grade

router.post(
    "/",
    authMiddleware,
    assignGrade
);



// Update Grade

router.put(
    "/:id",
    authMiddleware,
    updateGrade
);


module.exports = router;