const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");


const {
    createDepartment,
    getDepartments,
    getDepartment,
    updateDepartment,
    deleteDepartment
} = require("../controllers/departmentController");

router.post("/", authMiddleware, createDepartment);
router.get("/", authMiddleware, getDepartments);
router.get("/:id", authMiddleware, getDepartment);
router.put("/:id", authMiddleware, updateDepartment);
router.delete("/:id", authMiddleware, deleteDepartment);

module.exports = router;