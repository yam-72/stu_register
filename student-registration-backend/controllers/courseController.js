const db = require("../config/db");
// Create Course
const createCourse = async (req, res) => {

    try {

        const {
            course_code,
            course_name,
            credit_hour,
            department_id
        } = req.body;


        if(!course_code || !course_name || !credit_hour || !department_id){

            return res.status(400).json({
                success:false,
                message:"All fields are required"
            });

        }


        const [existing] = await db.query(
            "SELECT * FROM courses WHERE course_code=?",
            [course_code]
        );


        if(existing.length > 0){

            return res.status(409).json({
                success:false,
                message:"Course already exists"
            });

        }


        await db.query(
            `
            INSERT INTO courses
            (
            course_code,
            course_name,
            credit_hour,
            department_id
            )
            VALUES(?,?,?,?)
            `,
            [
                course_code,
                course_name,
                credit_hour,
                department_id
            ]
        );


        res.status(201).json({

            success:true,
            message:"Course created successfully"

        });



    }catch(error){

        res.status(500).json({

            success:false,
            error:error.message

        });

    }

};




// Get All Courses
const getCourses = async(req,res)=>{

    try{

        const [courses] = await db.query(
            `
            SELECT 
            c.course_id,
            c.course_code,
            c.course_name,
            c.credit_hour,
            d.department_name

            FROM courses c

            JOIN departments d

            ON c.department_id=d.department_id

            ORDER BY c.course_id DESC
            `
        );


        res.json({

            success:true,
            total:courses.length,
            courses

        });



    }catch(error){

        res.status(500).json({

            success:false,
            error:error.message

        });

    }

};




// Get Single Course
const getCourse = async(req,res)=>{

    try{

        const {id}=req.params;


        const [course]=await db.query(
            "SELECT * FROM courses WHERE course_id=?",
            [id]
        );


        if(course.length===0){

            return res.status(404).json({

                success:false,
                message:"Course not found"

            });

        }


        res.json({

            success:true,
            course:course[0]

        });



    }catch(error){

        res.status(500).json({

            success:false,
            error:error.message

        });

    }

};



// Update Course
const updateCourse = async(req,res)=>{

    try{

        const {id}=req.params;

        const {
            course_code,
            course_name,
            credit_hour
        }=req.body;


        await db.query(

            `
            UPDATE courses

            SET
            course_code=?,
            course_name=?,
            credit_hour=?

            WHERE course_id=?
            `,

            [
                course_code,
                course_name,
                credit_hour,
                id
            ]

        );


        res.json({

            success:true,
            message:"Course updated successfully"

        });



    }catch(error){

        res.status(500).json({

            success:false,
            error:error.message

        });

    }

};



// Delete Course
const deleteCourse = async(req,res)=>{

    try{

        const {id}=req.params;


        await db.query(
            "DELETE FROM courses WHERE course_id=?",
            [id]
        );


        res.json({

            success:true,
            message:"Course deleted successfully"

        });



    }catch(error){

        res.status(500).json({

            success:false,
            error:error.message

        });

    }

};



module.exports={
    createCourse,
    getCourses,
    getCourse,
    updateCourse,
    deleteCourse
};