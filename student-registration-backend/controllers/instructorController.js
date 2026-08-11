const db = require("../config/db");

// Create Instructor

const createInstructor = async (req, res) => {
    try {

        const {
            first_name,
            last_name,
            email,
            phone,
            department_id
        } = req.body;

      // Validate required fields
      
        if (!first_name || !last_name) {
            return res.status(400).json({
                success: false,
                message: "First name and last name are required."
            });
        }

       
        // Validate email if provided
        
        if (email) {

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a valid email address."
                });
            }

        }

        
        // Check duplicate email
        
        if (email) {

            const [existingInstructor] = await db.query(
                `
                SELECT instructor_id
                FROM instructors
                WHERE email = ?
                `,
                [email]
            );

            if (existingInstructor.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "An instructor with this email already exists."
                });
            }

        }

        // Check department
        
        if (department_id) {

            const [department] = await db.query(
                `
                SELECT department_id
                FROM departments
                WHERE department_id = ?
                `,
                [department_id]
            );

            if (department.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Department not found."
                });
            }

        }

        
        // Insert instructor
      
        const [result] = await db.query(
            `
            INSERT INTO instructors
            (
                first_name,
                last_name,
                email,
                phone,
                department_id
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                first_name,
                last_name,
                email || null,
                phone || null,
                department_id || null
            ]
        );

       
        // Success response
        
        res.status(201).json({
            success: true,
            message: "Instructor created successfully.",
            instructor_id: result.insertId
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message
        });

    }
};

// Get All Instructors

const getInstructors = async (req, res) => {
    try {

        const [instructors] = await db.query(`
            SELECT
                i.instructor_id,
                i.first_name,
                i.last_name,
                i.email,
                i.phone,
                i.department_id,
                d.department_name,
                i.created_at
            FROM instructors i
            LEFT JOIN departments d
                ON i.department_id = d.department_id
            ORDER BY i.instructor_id DESC
        `);

        res.status(200).json({
            success: true,
            total: instructors.length,
            instructors
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message
        });

    }
};

// Get One Instructor

const getInstructor = async (req, res) => {
    try {

        const { id } = req.params;

        // Check if instructor exists
        const [instructors] = await db.query(
            `
            SELECT
                i.instructor_id,
                i.first_name,
                i.last_name,
                i.email,
                i.phone,
                i.department_id,
                d.department_name,
                i.created_at
            FROM instructors i
            LEFT JOIN departments d
                ON i.department_id = d.department_id
            WHERE i.instructor_id = ?
            `,
            [id]
        );

        // Instructor not found
        if (instructors.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Instructor not found."
            });
        }

        // Success
        res.status(200).json({
            success: true,
            instructor: instructors[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message
        });

    }
};

// Update Instructor

const updateInstructor = async (req, res) => {
    try {

        const { id } = req.params;

        const {
            first_name,
            last_name,
            email,
            phone,
            department_id
        } = req.body;

        
        // Check instructor exists
       
        const [existingInstructor] = await db.query(
            `
            SELECT instructor_id
            FROM instructors
            WHERE instructor_id = ?
            `,
            [id]
        );

        if (existingInstructor.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Instructor not found."
            });
        }

        
        // Validate required fields
      
        if (!first_name || !last_name) {
            return res.status(400).json({
                success: false,
                message: "First name and last name are required."
            });
        }

       
        // Validate email
       
        if (email) {

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a valid email address."
                });
            }

        }

        
        // Check duplicate email
       
        if (email) {

            const [duplicateEmail] = await db.query(
                `
                SELECT instructor_id
                FROM instructors
                WHERE email = ?
                AND instructor_id != ?
                `,
                [email, id]
            );

            if (duplicateEmail.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "Another instructor already uses this email."
                });
            }

        }

       
        // Check department
       
        if (department_id) {

            const [department] = await db.query(
                `
                SELECT department_id
                FROM departments
                WHERE department_id = ?
                `,
                [department_id]
            );

            if (department.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Department not found."
                });
            }

        }

      
        // Update instructor
       
        await db.query(
            `
            UPDATE instructors
            SET
                first_name = ?,
                last_name = ?,
                email = ?,
                phone = ?,
                department_id = ?
            WHERE instructor_id = ?
            `,
            [
                first_name,
                last_name,
                email || null,
                phone || null,
                department_id || null,
                id
            ]
        );

        
        // Success response
        
        res.status(200).json({
            success: true,
            message: "Instructor updated successfully."
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message
        });

    }
};

// Delete Instructor

const deleteInstructor = async (req, res) => {
    try {

        const { id } = req.params;

        // Check instructor exists
        const [instructor] = await db.query(
            `
            SELECT instructor_id
            FROM instructors
            WHERE instructor_id = ?
            `,
            [id]
        );

        if (instructor.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Instructor not found."
            });
        }

        // Delete instructor
        await db.query(
            `
            DELETE FROM instructors
            WHERE instructor_id = ?
            `,
            [id]
        );

        return res.status(200).json({
            success: true,
            message: "Instructor deleted successfully."
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
    createInstructor,
    updateInstructor,
    getInstructors,
    getInstructor,
    deleteInstructor
};