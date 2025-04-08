module.exports = async function (req, res, next) {
  try {
    const token = await req.headers.authorization;
    if (!token) {
      return res.status(401).json({
        status: 401,
        message: "ไม่มีสิทธิ์เข้าถึง",
      });
    }
    // req.auth = token;
    next();
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Sever Error",
    });
  }
};
