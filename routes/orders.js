var express = require('express');
var router = express.Router();
var orderSchema = require('../models/order.model');
var productSchema = require('../models/product.model');
var jwtAuth = require("../middleware/token.middleware");

router.get('/orders', [jwtAuth], async function (req, res, next){
    try {
        const orders = await orderSchema.find()
        return res.status(200).json({
            status:200,
            message:"เรียกข้อมูลสำเร็จ",
            data:orders
        })
    } catch (error) {
        res.status(500).json({
            status:500,
            message:"ไม่พบข้อมูล",
            data:[]
        })
    }
})

module.exports = router;