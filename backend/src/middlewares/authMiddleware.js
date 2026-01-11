const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Định dạng gửi lên: "Bearer [token]"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access Denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    req.user = verified; // Lưu thông tin user vào request
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Admin access only' });
  }
};

module.exports = { verifyToken, isAdmin };