const e = require("cors");
const User = require("../models/User");
const bcrypt = require("bcrypt");

const updateMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, avatar_url, dark_mode } = req.body;

    const [updatedUser] = await User.updateById(userId, {
      username,
      avatar_url,
      dark_mode,
    });

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const profile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      username: user.username,
      email: user.email,
      avatar_url: user.avatar_url,
      dark_mode: user.dark_mode,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const userID = req.user.id;

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await User.comparePassword(
      currentPassword,
      user.password_hash
    );
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await User.updateById(userID, { password_hash: hashedPassword });

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
module.exports = { updateMe, profile, changePassword };
