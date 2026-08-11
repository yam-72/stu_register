const db = require("../config/db");

// Register Student For Course

const registerCourse = async (req, res) => {

    try {

        const {
            student_id,
            course_id,
            semester,
            academic_year
        } = req.body;


        // Validate fields
        if (!student_id || !course_id) {
            return res.status(400).json({
                success: false,
                message: "Student ID and Course ID are required."
            });
        }


        // Check student exists
        const [student] = await db.query(
            "SELECT * FROM students WHERE student_id = ?",
            [student_id]
        );


        if (student.length === 0) {
            return res.status(404).json({
                success:false,
                message:"Student not found."
            });
        }



        // Check course exists
        const [course] = await db.query(
            "SELECT * FROM courses WHERE course_id = ?",
            [course_id]
        );


        if (course.length === 0) {
            return res.status(404).json({
                success:false,
                message:"Course not found."
            });
        }



        // Prevent duplicate registration
        const [existing] = await db.query(
            `
            SELECT * FROM student_courses
            WHERE student_id = ?
            AND course_id = ?
            `,
            [
                student_id,
                course_id
            ]
        );


        if (existing.length > 0) {
            return res.status(409).json({
                success:false,
                message:"Student is already registered for this course."
            });
        }



        // Insert registration
        await db.query(
            `
            INSERT INTO student_courses
            (
                student_id,
                course_id,
                semester,
                academic_year
            )
            VALUES (?,?,?,?)
            `,
            [
                student_id,
                course_id,
                semester,
                academic_year
            ]
        );


        res.status(201).json({
            success:true,
            message:"Student registered for course successfully."
        });



    } catch(error){

        res.status(500).json({
            success:false,
            error:error.message
        });

    }

};

// Drop Course

const dropCourse = async (req, res) => {
    try {

        const { id } = req.params;

        // Check registration exists
        const [registration] = await db.query(
            `
            SELECT *
            FROM student_courses
            WHERE id = ?
            `,
            [id]
        );

        if (registration.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Course registration not found."
            });
        }

        // Delete registration
        await db.query(
            `
            DELETE FROM student_courses
            WHERE id = ?
            `,
            [id]
        );

        return res.status(200).json({
            success: true,
            message: "Course dropped successfully."
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            error: error.message
        });

    }
};

// Get Student Registered Courses

const getStudentCourses = async (req, res) => {
    try {

        const { student_id } = req.params;

        
        // Check student exists
       
        const [student] = await db.query(
            `
            SELECT
                student_id,
                first_name,
                last_name,
                registration_number
            FROM students
            WHERE student_id = ?
            `,
            [student_id]
        );

        if (student.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

       
        // Get registered courses
       
        const [courses] = await db.query(
            `
            SELECT
                sc.id AS registration_id,
                c.course_id,
                c.course_code,
                c.course_name,
                c.credit_hour,
                d.department_name,
                sc.semester,
                sc.academic_year,
                sc.registered_at

            FROM student_courses sc

            INNER JOIN courses c
                ON sc.course_id = c.course_id

            LEFT JOIN departments d
                ON c.department_id = d.department_id

            WHERE sc.student_id = ?

            ORDER BY sc.registered_at DESC
            `,
            [student_id]
        );

        
        // Success response
       
        return res.status(200).json({
            success: true,

            student: student[0],

            total_courses: courses.length,

            total_credit_hours: courses.reduce(
                (total, course) =>
                    total + Number(course.credit_hour),
                0
            ),

            courses
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            error: error.message
        });

    }
};



module.exports = {
    registerCourse,
    dropCourse,
    getStudentCourses
};