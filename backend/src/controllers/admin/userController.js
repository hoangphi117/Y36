const User = require('../../models/User');

const getUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const changeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await User.changeStatus(req.params.id, status);
    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.deleteUser(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers, deleteUser, changeStatus };