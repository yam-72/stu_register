const jwt = require("jsonwebtoken");

function generateToken(userId, role) {
    return jwt.sign(
        {
            userId,
            role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
}

module.exports = generateToken;