const express = require("express");
const router = express.Router();
//const generateResetToken = require("../utils/generateResetToken");
//const sendEmail = require("../utils/sendEmail");

const {
    register,
    login,
    forgotPassword,
    resetPassword,
    changePassword
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");


// Register
router.post("/register", register);


// Login
router.post("/login", login);


// Forgot Password
router.post("/forgot-password", forgotPassword);

//Reset password
router.post(
    "/reset-password",
    resetPassword
);

//change password
router.post(
    "/change-password",
    authMiddleware,
    changePassword
);


// Protected Profile Route
router.get("/profile", authMiddleware, (req, res) => {

    res.status(200).json({
        success: true,
        message: "Welcome to your profile",
        user: req.user
    });

});


module.exports = router;