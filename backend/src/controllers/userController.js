const User = require('../models/User');


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
module.exports = { updateMe };