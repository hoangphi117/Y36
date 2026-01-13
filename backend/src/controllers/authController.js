const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) return res.status(400).json({ message: "Email not found" });

    const validPass = await bcrypt.compare(password, user.password_hash);
    if (!validPass)
      return res.status(400).json({ message: "Invalid password" });

    // 3. Tạo Token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: process.env.EXPIRE_TIME || "1d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.username,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const register = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if(!email || !username || !password) {
      return res.status(400).json({ message: "Please provide email, username and password" });
    }

    const existingUsername = await User.findByUserName(username);
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }
    const existingUser = await User.findByEmail(email);

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = {
      email,
      username,
      password_hash: hashedPassword,
      role: "customer",
      status: "active",
    };

    const createdUsers = await User.createUser(newUser);
    const createdUser = createdUsers[0];
    res
      .status(201)
      .json({
        id: createdUser.id,
        email: createdUser.email,
        username: createdUser.username,
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { login,register };
