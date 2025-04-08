var express = require("express");
var router = express.Router();
var productSchema = require("../models/product.model");
var getId = require("../Util/getUserFromToken");
var jwtAuth = require("../middleware/token.middleware");
var multer = require("multer");
var fs = require("fs");
var path = require("path");
var orderSchema = require('../models/order.model')
const { error } = require("console");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().getTime() + "_" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/products", [jwtAuth], async function (req, res, next) {
  const userId = getId(req.headers.authorization);
  const products = await productSchema.find({ customer: userId });
  try {
    res.status(200).json({
      status: 200,
      message: "เรียกข้อมูลสำเร็จแล้ว",
      data: products,
    });
  } catch (error) {
    res.status(404).json({
      status: 404,
      message: "ไม่พบข้อมูลสินค้า",
      data: [],
    });
  }
});

router.post(
  "/products",
  [jwtAuth, upload.single("image")],
  async function (req, res, next) {
    try {
      let { productName, description, productnum } = req.body;
      const image = (await req.file) ? req.file.filename : null;
      const userId = getId(req.headers.authorization);
      console.log(req.headers.authorization);
      let products = new productSchema({
        productName: productName,
        description: description,
        productnum: productnum,
        image: image,
        customer: userId,
      });
      await products.save();
      res.status(201).send({
        status: 200,
        message: "เพิ่มข้อมูลProductสำเร็จ",
        data: products,
      });
    } catch (error) {
      res.status(400).send({
        status: 400,
        message: "เพิ่มข้อมูลProductล้มเหลว",
      });
    }
  }
);

router.put(
  "/products/:id",
  [jwtAuth, upload.single("image")],
  async function (req, res, next) {
    let { productName, description, productnum } = req.body;
    const userId = getId(req.headers.authorization);
    const image = req.file ? req.file.filename : null;
    const { id } = req.params;

    try {
      // ตรวจสอบว่าผลิตภัณฑ์นี้เป็นของ user นี้จริงหรือไม่
      const product = await productSchema.findOne({
        _id: id,
        customer: userId,
      });
      if (!product) {
        return res.status(404).json({
          status: 404,
          message: "ไม่พบข้อมูลสินค้า",
        });
      }

      // ลบรูปเก่า (ถ้ามี) และมีการอัปโหลดรูปใหม่
      if (image) {
        const oldImage = product.image;
        if (oldImage) {
          const imagePath = path.join(__dirname, "../public/images", oldImage);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }
      }

      // อัปเดตเฉพาะข้อมูลที่ส่งมา
      const updateProduct = { productName, description, productnum };
      if (image) {
        updateProduct.image = image;
      }

      const updatedProduct = await productSchema.findByIdAndUpdate(
        id,
        updateProduct,
        { new: true }
      );

      res.status(200).send({
        status: 200,
        message: "แก้ไขข้อมูลเรียบร้อย",
        data: updatedProduct,
      });
    } catch (error) {
      res.status(500).send({
        status: 500,
        message: "แก้ไขข้อมูลล้มเหลว",
        error: error.message,
      });
    }
  }
);

router.delete("/products/:id", [jwtAuth], async function (req, res, next) {
  const userId = getId(req.headers.authorization);
  let { id } = req.params;
  try {
       await productSchema.findByIdAndDelete(id, { customer: userId });
    res.status(200).send({
      status: 200,
      message: "ลบข้อมูลเรียบร้อย",
      data: userId,
    });
  } catch (error) { res.status(500).send({
    status: 500,
    message: "แก้ไขข้อมูลล้มเหลว",
    error: error.message,
  });}
});

router.get("/products/:id/orders", [jwtAuth], async function (req, res, next) {
  const { id } = req.params;
  const orders = await orderSchema.find({ productId: id });
  try {
    res.status(200).json({
      status: 200,
      message: "เรียกข้อมูลสำเร็จแล้ว",
      data: orders,
    });
  } catch (error) {
    res.status(404).json({
      status: 404,
      message: "ไม่พบข้อมูลสินค้า",
      data: [],
    });
  }
});

router.post("/products/:id/orders", [jwtAuth], async function (req, res, next) {
  const { id } = req.params;
  const { ordernum } = req.body;

  if (!ordernum || ordernum <= 0) {
    return res.status(400).json({
      status: 400,
      message: "กรุณาระบุจำนวนที่ต้องการสั่งให้ถูกต้อง",
    });
  }

  try {
    // ตรวจสอบว่าสินค้ามีอยู่
    const product = await productSchema.findById(id);
    if (!product) {
      return res.status(404).json({
        status: 404,
        message: "ไม่พบข้อมูลสินค้า",
        data: [],
      });
    }

    // หา orders ที่เคยมีของสินค้าชิ้นนี้
    const orders = await orderSchema.find({ productId: id });

    // รวมจำนวนที่เคยสั่งไปแล้ว
    const totalQuantity = orders.reduce((acc, curr) => acc + curr.ordernum, 0);

    // ตรวจสอบว่า stock เพียงพอหรือไม่
    if (product.productnum < ordernum + totalQuantity) {
      return res.status(400).json({
        status: 400,
        message: `จำนวนสินค้าในสต๊อกไม่เพียงพอ เหลือเพียง ${product.productnum - totalQuantity} ชิ้น`,
      });
    }

    // สร้าง order ใหม่
    const order = new orderSchema({
      productId: id,
      ordernum: ordernum,
    });

    await order.save();

    res.status(200).json({
      status: 200,
      message: "ทำการสั่งซื้อเรียบร้อยแล้ว",
      data: order,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "เกิดข้อผิดพลาดในระบบ",
    });
  }
});

module.exports = router;
