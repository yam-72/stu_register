const db = require("../config/db");


// Assign Grade

const assignGrade = async (req, res) => {
    try {

        // Check request body
        if (!req.body) {
            return res.status(400).json({
                success: false,
                message: "Request body is missing."
            });
        }

        const {
            student_course_id,
            grade,
            remark
        } = req.body;

        // Validate required fields
        if (!student_course_id || !grade) {
            return res.status(400).json({
                success: false,
                message: "Student course ID and grade are required."
            });
        }

        // Validate grade value
        const validGrades = [
            "A",
            "A-",
            "B+",
            "B",
            "B-",
            "C+",
            "C",
            "C-",
            "D",
            "F"
        ];

        if (!validGrades.includes(grade)) {
            return res.status(400).json({
                success: false,
                message: "Invalid grade."
            });
        }

        // Check if student course registration exists
        const [registration] = await db.query(
            "SELECT * FROM student_courses WHERE id = ?",
            [student_course_id]
        );

        if (registration.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student course registration not found."
            });
        }

        // Check if grade already exists
        const [existingGrade] = await db.query(
            "SELECT * FROM grades WHERE student_course_id = ?",
            [student_course_id]
        );

        if (existingGrade.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Grade already assigned for this course."
            });
        }

        // Insert grade
        await db.query(
            `
            INSERT INTO grades
            (
                student_course_id,
                grade,
                remark
            )
            VALUES (?, ?, ?)
            `,
            [
                student_course_id,
                grade,
                remark || null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Grade assigned successfully."
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message
        });

    }
};

// Get Student Grades

const getStudentGrades = async (req, res) => {

    try {

        const { id } = req.params;


        // Check student exists
        const [student] = await db.query(
            `
            SELECT 
                student_id,
                first_name,
                last_name
            FROM students
            WHERE student_id = ?
            `,
            [id]
        );


        if (student.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }


        // Get grades
        const [grades] = await db.query(
            `
            SELECT
                c.course_code,
                c.course_name,
                c.credit_hour,
                sc.semester,
                sc.academic_year,
                g.grade,
                g.remark

            FROM grades g

            INNER JOIN student_courses sc
            ON g.student_course_id = sc.id

            INNER JOIN courses c
            ON sc.course_id = c.course_id

            WHERE sc.student_id = ?
            `,
            [id]
        );


        res.status(200).json({
            success: true,
            student: student[0],
            total_courses: grades.length,
            grades
        });


    } catch(error) {

        res.status(500).json({
            success:false,
            error:error.message
        });

    }

};

// Update Grade

const updateGrade = async (req, res) => {
    try {

        const { id } = req.params;

        const {
            grade,
            remark
        } = req.body;

        // Validate request body
        if (!grade) {
            return res.status(400).json({
                success: false,
                message: "Grade is required."
            });
        }

        // Valid grades
        const validGrades = [
            "A",
            "A-",
            "B+",
            "B",
            "B-",
            "C+",
            "C",
            "C-",
            "D",
            "F"
        ];

        if (!validGrades.includes(grade)) {
            return res.status(400).json({
                success: false,
                message: "Invalid grade."
            });
        }

        // Check grade exists
        const [existingGrade] = await db.query(
            "SELECT * FROM grades WHERE grade_id = ?",
            [id]
        );

        if (existingGrade.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Grade not found."
            });
        }

        // Update grade
        await db.query(
            `
            UPDATE grades
            SET grade = ?, remark = ?
            WHERE grade_id = ?
            `,
            [
                grade,
                remark || null,
                id
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Grade updated successfully."
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Calculate Student GPA

const calculateGPA = async (req, res) => {
    try {

        const { id } = req.params;

        // Check student exists
        const [student] = await db.query(
            `
            SELECT
                student_id,
                first_name,
                last_name
            FROM students
            WHERE student_id = ?
            `,
            [id]
        );

        if (student.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        // Get student's completed courses and grades
        const [courses] = await db.query(
            `
            SELECT
                c.course_code,
                c.course_name,
                c.credit_hour,
                g.grade,
                g.remark,
                sc.semester,
                sc.academic_year
            FROM grades g

            INNER JOIN student_courses sc
                ON g.student_course_id = sc.id

            INNER JOIN courses c
                ON sc.course_id = c.course_id

            WHERE sc.student_id = ?
            `,
            [id]
        );

        // No grades yet
        if (courses.length === 0) {
            return res.status(200).json({
                success: true,
                student: student[0],
                total_courses: 0,
                total_credit_hours: 0,
                gpa: 0,
                message: "No grades available for this student."
            });
        }

        // Grade point mapping
        const gradePoints = {
            "A": 4.0,
            "A-": 3.7,
            "B+": 3.3,
            "B": 3.0,
            "B-": 2.7,
            "C+": 2.3,
            "C": 2.0,
            "C-": 1.7,
            "D": 1.0,
            "F": 0.0
        };

        let totalQualityPoints = 0;
        let totalCreditHours = 0;

        const result = courses.map(course => {

            const point = gradePoints[course.grade];

            const qualityPoints =
                point * Number(course.credit_hour);

            totalQualityPoints += qualityPoints;
            totalCreditHours += Number(course.credit_hour);

            return {
                ...course,
                grade_point: point,
                quality_points: qualityPoints
            };
        });

        // Calculate GPA
        const gpa =
            totalCreditHours > 0
                ? totalQualityPoints / totalCreditHours
                : 0;

        res.status(200).json({
            success: true,

            student: student[0],

            total_courses: result.length,

            total_credit_hours: totalCreditHours,

            total_quality_points: Number(
                totalQualityPoints.toFixed(2)
            ),

            gpa: Number(
                gpa.toFixed(2)
            ),

            courses: result
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
module.exports = {
    assignGrade,
    getStudentGrades,
    updateGrade,
    calculateGPA
};