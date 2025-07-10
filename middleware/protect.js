const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Ambil token dari header
      token = req.headers.authorization.split(' ')[1];

      // Verifikasi token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Ambil user dari database (tanpa password)
      req.user = await User.findById(decoded.user.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Tidak terotorisasi, user tidak ditemukan.' });
      }

      next(); // Lanjutkan ke handler route
    } catch (error) {
      console.error('Token error:', error.message);
      return res.status(401).json({ message: 'Tidak terotorisasi, token gagal.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Tidak terotorisasi, tidak ada token.' });
  }
};

module.exports = protect;