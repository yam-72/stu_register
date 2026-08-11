const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createInstructor,
    getInstructors,
    getInstructor,
    updateInstructor,
    deleteInstructor
} = require("../controllers/instructorController");


// Create Instructor

router.post(
    "/",
    authMiddleware,
    createInstructor
);

// Get All Instructors

router.get(
    "/",
    authMiddleware,
    getInstructors
);
// Get One Instructor

router.get(
    "/:id",
    authMiddleware,
    getInstructor
);

// Update Instructor

router.put(
    "/:id",
    authMiddleware,
    updateInstructor
);

// Delete Instructor

router.delete(
    "/:id",
    authMiddleware,
    deleteInstructor
);


module.exports = router;