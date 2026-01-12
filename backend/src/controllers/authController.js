const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findByEmail(email);
    if (!user) return res.status(400).json({ message: 'Email not found' });

    const validPass = await bcrypt.compare(password, user.password_hash);
    if (!validPass) return res.status(400).json({ message: 'Invalid password' });

    // 3. Tạo Token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: process.env.EXPIRE_TIME || '1d' }
    );

    res.json({ token, user: { id: user.id, name: user.username, role: user.role, status: user.status } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { login };