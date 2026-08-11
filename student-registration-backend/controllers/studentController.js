
const db = require("../config/db");

// =====================================================
// CREATE STUDENT
// =====================================================

const createStudent = async (req, res) => {
    try {
        const {
            registration_number,
            first_name,
            last_name,
            gender,
            email,
            phone,
            date_of_birth,
            address,
            department_id,
            admission_year
        } = req.body;

        // Required fields
        if (
            !registration_number ||
            !first_name ||
            !last_name ||
            !gender ||
            !email
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields."
            });
        }

        // Check duplicate email or registration number
        const [existingStudent] = await db.query(
            `
            SELECT student_id
            FROM students
            WHERE email = ? OR registration_number = ?
            LIMIT 1
            `,
            [email, registration_number]
        );

        if (existingStudent.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Student with this email or registration number already exists."
            });
        }

        // Create student
        const [result] = await db.query(
            `
            INSERT INTO students (
                registration_number,
                first_name,
                last_name,
                gender,
                email,
                phone,
                date_of_birth,
                address,
                department_id,
                admission_year
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                registration_number,
                first_name,
                last_name,
                gender,
                email,
                phone || null,
                date_of_birth || null,
                address || null,
                department_id || null,
                admission_year || null
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Student registered successfully.",
            student_id: result.insertId
        });

    } catch (error) {
        console.error("Create student error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create student.",
            error: error.message
        });
    }
};


// =====================================================
// GET ALL STUDENTS
// =====================================================

const getStudents = async (req, res) => {
    try {
        const [students] = await db.query(
            `
            SELECT
                s.student_id,
                s.registration_number,
                s.first_name,
                s.last_name,
                s.gender,
                s.email,
                s.phone,
                s.date_of_birth,
                s.address,
                s.department_id,
                s.admission_year,
                s.status,
                s.photo,
                d.department_name
            FROM students AS s
            LEFT JOIN departments AS d
                ON s.department_id = d.department_id
            ORDER BY s.student_id DESC
            `
        );

        console.log("Students returned from database:", students);

        return res.status(200).json({
            success: true,
            total: students.length,

            // Main response
            students: students,

            // Also provide data for frontend compatibility
            data: students
        });

    } catch (error) {
        console.error("Get students error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch students.",
            error: error.message,

            // Always return an array to avoid frontend errors
            students: [],
            data: []
        });
    }
};


// =====================================================
// GET ONE STUDENT
// =====================================================

const getStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const [student] = await db.query(
            `
            SELECT
                s.student_id,
                s.registration_number,
                s.first_name,
                s.last_name,
                s.gender,
                s.email,
                s.phone,
                s.date_of_birth,
                s.address,
                s.department_id,
                s.admission_year,
                s.status,
                s.photo,
                d.department_name
            FROM students AS s
            LEFT JOIN departments AS d
                ON s.department_id = d.department_id
            WHERE s.student_id = ?
            LIMIT 1
            `,
            [id]
        );

        if (student.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        return res.status(200).json({
            success: true,
            student: student[0],
            data: student[0]
        });

    } catch (error) {
        console.error("Get student error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch student.",
            error: error.message
        });
    }
};


// =====================================================
// UPDATE STUDENT
// =====================================================

const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            registration_number,
            first_name,
            last_name,
            gender,
            email,
            phone,
            date_of_birth,
            address,
            department_id,
            admission_year,
            status
        } = req.body;

        // Check student exists
        const [student] = await db.query(
            `
            SELECT student_id
            FROM students
            WHERE student_id = ?
            LIMIT 1
            `,
            [id]
        );

        if (student.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        // Check duplicate email or registration number
        const [duplicate] = await db.query(
            `
            SELECT student_id
            FROM students
            WHERE (email = ? OR registration_number = ?)
            AND student_id != ?
            LIMIT 1
            `,
            [
                email,
                registration_number,
                id
            ]
        );

        if (duplicate.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email or registration number already exists."
            });
        }

        // Update student
        await db.query(
            `
            UPDATE students
            SET
                registration_number = ?,
                first_name = ?,
                last_name = ?,
                gender = ?,
                email = ?,
                phone = ?,
                date_of_birth = ?,
                address = ?,
                department_id = ?,
                admission_year = ?,
                status = ?
            WHERE student_id = ?
            `,
            [
                registration_number,
                first_name,
                last_name,
                gender,
                email,
                phone || null,
                date_of_birth || null,
                address || null,
                department_id || null,
                admission_year || null,
                status || "active",
                id
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Student updated successfully."
        });

    } catch (error) {
        console.error("Update student error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update student.",
            error: error.message
        });
    }
};


// =====================================================
// DELETE STUDENT
// =====================================================

const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        // Check student exists
        const [student] = await db.query(
            `
            SELECT student_id
            FROM students
            WHERE student_id = ?
            LIMIT 1
            `,
            [id]
        );

        if (student.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        // Delete student
        await db.query(
            `
            DELETE FROM students
            WHERE student_id = ?
            `,
            [id]
        );

        return res.status(200).json({
            success: true,
            message: "Student deleted successfully."
        });

    } catch (error) {
        console.error("Delete student error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete student.",
            error: error.message
        });
    }
};


// =====================================================
// UPLOAD STUDENT PHOTO
// =====================================================

const uploadStudentPhoto = async (req, res) => {
    try {
        const { id } = req.params;

        // Check student exists
        const [student] = await db.query(
            `
            SELECT student_id
            FROM students
            WHERE student_id = ?
            LIMIT 1
            `,
            [id]
        );

        if (student.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        // Check uploaded file
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a photo."
            });
        }

        const photoPath = `/uploads/students/${req.file.filename}`;

        // Save photo path
        await db.query(
            `
            UPDATE students
            SET photo = ?
            WHERE student_id = ?
            `,
            [photoPath, id]
        );

        return res.status(200).json({
            success: true,
            message: "Student photo uploaded successfully.",
            photo: photoPath
        });

    } catch (error) {
        console.error("Upload student photo error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to upload student photo.",
            error: error.message
        });
    }
};


// =====================================================
// GET STUDENT REGISTERED COURSES
// =====================================================

const getStudentCourses = async (req, res) => {
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
            LIMIT 1
            `,
            [id]
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
                c.course_id,
                c.course_code,
                c.course_name,
                c.credit_hour,
                sc.semester,
                sc.academic_year
            FROM student_courses AS sc
            INNER JOIN courses AS c
                ON sc.course_id = c.course_id
            WHERE sc.student_id = ?
            ORDER BY c.course_id DESC
            `,
            [id]
        );

        return res.status(200).json({
            success: true,
            student: student[0],
            total_courses: courses.length,
            courses,
            data: courses
        });

    } catch (error) {
        console.error("Get student courses error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch student courses.",
            error: error.message,
            courses: [],
            data: []
        });
    }
};


// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
    createStudent,
    getStudents,
    getStudent,
    updateStudent,
    deleteStudent,
    uploadStudentPhoto,
    getStudentCourses
};
