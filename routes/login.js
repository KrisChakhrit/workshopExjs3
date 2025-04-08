var express = require("express");
var router = express.Router();
var userSchema = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
// const tokenmiddleware = require('../middleware/token.middleware')

router.post('/login', async function(req, res, next) {
    let { name, password } = req.body;

    try {

        let users = await userSchema.findOne({ name });

        if (!users) {
            return res.status(403).json({ message: "ไม่พบข้อมูลผู้ใช้" });
        }

        
        if (!users.isapprove) {
            return res.status(401).json({ message: "บัญชีของคุณยังไม่ได้รับการอนุมัติ" });
        }

        
        const isMatch = await bcrypt.compare(password, users.password);
        if (!isMatch) {
            return res.status(403).json({
                status: 403,
                message: "รหัสผ่านของผู้ใช้ไม่ถูกต้อง"
            });
        }
       
        const token = jwt.sign(
            { name: users.name, id: users._id },
            process.env.JWT_KEY,
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            status: 200,
            message: "เข้าสู่ระบบสำเร็จ",
            token
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
            error: error.message
        });
    }
});

module.exports = router;
