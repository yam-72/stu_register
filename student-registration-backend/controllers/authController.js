const db = require("../config/db");
 const bcrypt = require("bcrypt");
  const generateToken = require("../utils/generateToken"); 
  const generateResetToken = require("../utils/generateResetToken"); 
  const sendEmail = require("../utils/sendEmail");
// Register User
async function register(req, res) {
    try {
        const {
            username,
            first_name,
            last_name,
            email,
            password,
            role
        } = req.body;

        if (!username || !first_name || !last_name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const [user] = await db.query(
            "SELECT * FROM users WHERE email = ? OR username = ?",
            [email, username]
        );

        if (user.length > 0) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            `INSERT INTO users
            (username, first_name, last_name, email, password, role)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                username,
                first_name,
                last_name,
                email,
                hashedPassword,
                role || "registrar"
            ]
        );

        res.status(201).json({
            success: true,
            message: "User registered successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}


// Login User

async function login(req, res) {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const [rows] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const user = rows[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = generateToken(user.user_id, user.role);

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.user_id,
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Forgot Password

async function forgotPassword(req,res){

    try{

        const {email}=req.body;


        if(!email){

            return res.status(400).json({
                success:false,
                message:"Email is required"
            });

        }


        const [users]=await db.query(
            "SELECT * FROM users WHERE email=?",
            [email]
        );


        if(users.length===0){

            return res.status(404).json({
                success:false,
                message:"User not found"
            });

        }


        const user=users[0];


        const token=generateResetToken();


        const expiresAt = new Date(
            Date.now()+60*60*1000
        );


        await db.query(

            `
            INSERT INTO password_reset_tokens
            (user_id, reset_token, expires_at)

            VALUES(?,?,?)
            `,

            [
                user.user_id,
                token,
                expiresAt
            ]

        );


        const resetLink =
        `${process.env.CLIENT_URL}/reset-password/${token}`;


        await sendEmail(

            email,

            "Password Reset",

            `
            <h2>Password Reset Request</h2>

            <p>Click the link below to reset your password:</p>

            <a href="${resetLink}">
            Reset Password
            </a>

            <p>This link expires in 1 hour.</p>
            `

        );


        res.json({

            success:true,

            message:"Password reset email sent"

        });



    }catch(error){

        res.status(500).json({

            success:false,

            error:error.message

        });

    }

}
// Reset Password
async function resetPassword(req, res) {

    try {

        const {
            token,
            newPassword
        } = req.body;


        if (!token || !newPassword) {

            return res.status(400).json({
                success: false,
                message: "Token and new password are required"
            });

        }


        // Find valid token
        const [tokens] = await db.query(
            `
            SELECT *
            FROM password_reset_tokens
            WHERE reset_token = ?
            AND expires_at > NOW()
            `,
            [token]
        );


        if (tokens.length === 0) {

            return res.status(400).json({
                success: false,
                message: "Invalid or expired token"
            });

        }


        const resetToken = tokens[0];


        // Hash new password
        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );


        // Update password
        await db.query(
            `
            UPDATE users
            SET password = ?
            WHERE user_id = ?
            `,
            [
                hashedPassword,
                resetToken.user_id
            ]
        );


        // Delete used token
        await db.query(
            `
            DELETE FROM password_reset_tokens
            WHERE token_id = ?
            `,
            [
                resetToken.token_id
            ]
        );


        res.json({

            success: true,

            message: "Password reset successfully"

        });


    } catch(error) {

        res.status(500).json({

            success:false,

            error:error.message

        });

    }

}

// Change Password
async function changePassword(req, res) {

    try {

        const userId = req.user.id;

        const {
            currentPassword,
            newPassword
        } = req.body;


        if (!currentPassword || !newPassword) {

            return res.status(400).json({

                success: false,
                message: "Current password and new password are required"

            });

        }


        // Get user
        const [users] = await db.query(

            "SELECT * FROM users WHERE user_id=?",

            [userId]

        );


        if (users.length === 0) {

            return res.status(404).json({

                success:false,
                message:"User not found"

            });

        }


        const user = users[0];


        // Check old password
        const isMatch = await bcrypt.compare(

            currentPassword,

            user.password

        );


        if (!isMatch) {

            return res.status(401).json({

                success:false,

                message:"Current password is incorrect"

            });

        }


        // Hash new password
        const hashedPassword = await bcrypt.hash(

            newPassword,

            10

        );


        // Update password
        await db.query(

            `
            UPDATE users
            SET password=?
            WHERE user_id=?
            `,

            [
                hashedPassword,
                userId
            ]

        );


        res.json({

            success:true,

            message:"Password changed successfully"

        });


    } catch(error) {


        res.status(500).json({

            success:false,

            error:error.message

        });


    }

}

module.exports = {
    register,
    login,
    forgotPassword,
    resetPassword,
    changePassword
};