const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");


const {

createCourse,
getCourses,
getCourse,
updateCourse,
deleteCourse

}=require("../controllers/courseController");



router.post("/",authMiddleware,createCourse);

router.get("/",authMiddleware,getCourses);

router.get("/:id",authMiddleware,getCourse);

router.put("/:id",authMiddleware,updateCourse);

router.delete("/:id",authMiddleware,deleteCourse);



module.exports=router;