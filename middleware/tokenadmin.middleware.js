var jwt = require('jsonwebtoken');
var userSchema = require('../models/user.model'); // Ensure User model is imported

/* JWT Authorization Admin */
module.exports = async function (req, res, next) {
    const token = req.headers.authorization;
    jwt.verify(token, process.env.JWT_KEY, async function (err, decoded) {
        console.log(token)
        if (err) {
            return res.status(403).json({
                status:403,
                message:"โทเค็นไม่ถูกต้อง",
                data:null
            });
        }
        const user = await userSchema.findById(decoded.id); // Fetch user from database
        if (!user || !user.isadmin) { // Check if user exists and is an admin
            return res.status(500).json({
                status:500,
                message:"โทเค็นไม่ถูกต้อง",
                data:null
            });
        }
        req.userId = decoded.userId;
        next();
    });
}