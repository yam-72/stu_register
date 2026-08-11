
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadStudentPhoto");

const {
    createStudent,
    getStudents,
    getStudent,
    updateStudent,
    deleteStudent,
    uploadStudentPhoto,
    getStudentCourses
} = require("../controllers/studentController");


// =====================================================
// STUDENT ROUTES
// =====================================================

// Create Student
// POST /api/students
router.post(
    "/",
    authMiddleware,
    createStudent
);


// Get All Students
// GET /api/students
router.get(
    "/",
    authMiddleware,
    getStudents
);


// Get Student Registered Courses
// GET /api/students/:id/courses
// IMPORTANT: This must come BEFORE /:id
router.get(
    "/:id/courses",
    authMiddleware,
    getStudentCourses
);


// Get Single Student
// GET /api/students/:id
router.get(
    "/:id",
    authMiddleware,
    getStudent
);


// Update Student
// PUT /api/students/:id
router.put(
    "/:id",
    authMiddleware,
    updateStudent
);


// Delete Student
// DELETE /api/students/:id
router.delete(
    "/:id",
    authMiddleware,
    deleteStudent
);


// Upload Student Photo
// POST /api/students/:id/photo
router.post(
    "/:id/photo",
    authMiddleware,
    upload.single("photo"),
    uploadStudentPhoto
);


module.exports = router;

