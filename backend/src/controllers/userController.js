const User = require("../models/User");
const bcrypt = require("bcryptjs");

const updateMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, dark_mode } = req.body;

    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (dark_mode !== undefined) updateData.dark_mode = dark_mode;

    if (req.file) {
      updateData.avatar_url = req.file.path;
    }

    const [updatedUser] = await User.updateById(userId, updateData);

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
      user_id: user.id,
      username: user.username,
      email: user.email,
      avatar_url: user.avatar_url,
      dark_mode: user.dark_mode,
      created_at: user.created_at,
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

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Missing password fields" });
    }

    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = bcrypt.compareSync(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
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

const searchUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { username } = req.query;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    if (!username) {
      return res.status(400).json({ message: "username is required" });
    }

    const [users, total] = await Promise.all([
      User.searchUsersWithFriendStatus(currentUserId, username, limit, offset),
      User.countSearchUsers(currentUserId, username),
    ]);

    res.status(200).json({
      results: users.length,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
module.exports = { updateMe, profile, changePassword, searchUsers };
