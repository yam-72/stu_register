// app.js

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Database
const db = require("./config/db");

// Routes
const authRoute = require("./routes/authRoute");
const studentRoute = require("./routes/studentRoute");
const departmentRoute = require("./routes/departmentRoute");
const courseRoute = require("./routes/courseRoute");
const registrationRoute = require("./routes/registrationRoute");
const gradeRoute = require("./routes/gradeRoute");
const instructorRoute = require("./routes/instructorRoute");


// Middlewares

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Serve uploaded student photos
app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

// API Routes


app.use("/api/auth", authRoute);

app.use("/api/students", studentRoute);

app.use("/api/departments", departmentRoute);

app.use("/api/courses", courseRoute);

app.use("/api/registrations", registrationRoute);

app.use("/api/grades", gradeRoute);
app.use("/api/instructors", instructorRoute);


// Home Route


app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "🎓 Welcome to Student Registration API"
    });
});


// Database Test


app.get("/test-db", async (req, res) => {
    try {

        const connection = await db.getConnection();

        connection.release();

        res.status(200).json({
            success: true,
            message: "Database Connected Successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            error: error.message
        });

    }
});


// 404 Handler


app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route Not Found"
    });
});


// Global Error Handler


app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });

});

// Export app
module.exports = app;