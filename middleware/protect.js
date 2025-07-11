const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";

  // Cek apakah ada token dan formatnya benar
  if (!authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "❌ Tidak terotorisasi, token tidak ditemukan." });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ambil user dari database (tanpa password)
    const user = await User.findById(decoded.user.id).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ message: "❌ Tidak terotorisasi, user tidak ditemukan." });
    }

    // Tempelkan user ke request object
    req.user = user;

    // Lanjut ke handler berikutnya
    return next();
  } catch (err) {
    console.error("❌ JWT verification failed:", err.message);
    return res
      .status(403)
      .json({ message: "❌ Token tidak valid atau sudah kedaluwarsa." });
  }
};

module.exports = protect;
