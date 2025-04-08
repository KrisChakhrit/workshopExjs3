var express = require("express");
var router = express.Router();
var userSchema = require("../models/user.model");
var bcrypt = require("bcrypt");
var tokenadmin = require('../middleware/tokenadmin.middleware')

/* GET users listing. */
router.get("/users", async function (req, res, next) {
  try {
    let users = await userSchema.find({});
    res.status(200).send({
      status: 200,
      message: "success",
      data: users,
    });
  } catch (error) {
    res.send(error);
  }
});

router.post("/register", async function (req, res, next) {
  let { name, password } = req.body;

  try {
    let users = new userSchema({
      name: name,
      password: await bcrypt.hash(password, 10),
    });
    await users.save();
    res.status(201).send({
      status: 200,
      message: "เพิ่มผู้ใช้งานสำเร็จ",
      data: users,
    });
  } catch (error) {
    res.status(400).send({
      status: 400,
      message: "เพิ่มผู้ใช้งานล้มเหลว",
    });
  }
});

router.put("/users/:id/approve",[tokenadmin], async function (req, res, next) {
  let { isapprove } = req.body;
  let { id } = req.params;

  try {
    const users = await userSchema.findByIdAndUpdate(
      id,
      { isapprove },
      { new: true }
    );
    res.status(200).json({
      status: 200,
      message: "ได้้รับการอนุมัติแล้ว",
      data: users,
    });
  } catch (error) {
    res.send(403).json({
      status:403,
      message:"การอนุมัติล้มเหลว",
      data:[]
    });
  }
});
module.exports = router;
