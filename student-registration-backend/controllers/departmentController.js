const db = require("../config/db");

// Create Department
const createDepartment = async (req, res) => {
    try {
        const { department_name, department_code } = req.body;

        if (!department_name || !department_code) {
            return res.status(400).json({
                success: false,
                message: "Department name and code are required."
            });
        }

        const [existing] = await db.query(
            "SELECT * FROM departments WHERE department_name = ? OR department_code = ?",
            [department_name, department_code]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Department already exists."
            });
        }

        await db.query(
            "INSERT INTO departments (department_name, department_code) VALUES (?, ?)",
            [department_name, department_code]
        );

        res.status(201).json({
            success: true,
            message: "Department created successfully."
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get All Departments
const getDepartments = async (req, res) => {
    try {
        const [departments] = await db.query(
            "SELECT * FROM departments ORDER BY department_name ASC"
        );

        res.status(200).json({
            success: true,
            total: departments.length,
            departments
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get One Department
const getDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        const [department] = await db.query(
            "SELECT * FROM departments WHERE department_id = ?",
            [id]
        );

        if (department.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Department not found."
            });
        }

        res.status(200).json({
            success: true,
            department: department[0]
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


// Update Department

const updateDepartment = async (req, res) => {
    try {

        const { id } = req.params;

        const {
            department_name,
            department_code
        } = req.body;

        
        // Validate required fields
        
        if (!department_name || !department_code) {
            return res.status(400).json({
                success: false,
                message: "Department name and code are required."
            });
        }

       
        // Check department exists
        
        const [department] = await db.query(
            `
            SELECT department_id
            FROM departments
            WHERE department_id = ?
            `,
            [id]
        );

        if (department.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Department not found."
            });
        }

       
        // Check duplicate name/code
      
        const [existing] = await db.query(
            `
            SELECT department_id
            FROM departments
            WHERE (department_name = ? OR department_code = ?)
            AND department_id != ?
            `,
            [
                department_name,
                department_code,
                id
            ]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Another department already uses this name or code."
            });
        }

       
        // Update department
      
        await db.query(
            `
            UPDATE departments
            SET
                department_name = ?,
                department_code = ?
            WHERE department_id = ?
            `,
            [
                department_name,
                department_code,
                id
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Department updated successfully."
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            error: error.message
        });

    }
};



// Delete Department
const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;

       
        // Check department exists
       
        const [department] = await db.query(
            `
            SELECT department_id, department_name
            FROM departments
            WHERE department_id = ?
            `,
            [id]
        );

        if (department.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Department not found."
            });
        }

       
        // Check students
       
        const [students] = await db.query(
            `
            SELECT COUNT(*) AS total
            FROM students
            WHERE department_id = ?
            `,
            [id]
        );

      
        // Check courses
        
        const [courses] = await db.query(
            `
            SELECT COUNT(*) AS total
            FROM courses
            WHERE department_id = ?
            `,
            [id]
        );

        const studentCount = Number(students[0].total);
        const courseCount = Number(courses[0].total);

        
        // Prevent deletion
       
        if (studentCount > 0 || courseCount > 0) {
            return res.status(409).json({
                success: false,
                message: "Cannot delete department because it is still being used.",
                students: studentCount,
                courses: courseCount
            });
        }

       
        // Delete department
       
        await db.query(
            `
            DELETE FROM departments
            WHERE department_id = ?
            `,
            [id]
        );

        return res.status(200).json({
            success: true,
            message: "Department deleted successfully."
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
    createDepartment,
    getDepartments,
    getDepartment,
    updateDepartment,
    deleteDepartment
};