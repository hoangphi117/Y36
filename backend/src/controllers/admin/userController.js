const User = require('../../models/User');

const getUsers = async (req, res) => {
  try {
    const queryString = req.query;
    const users = await User.getAllUsers(queryString);
    const totalUsers = await User.countAllUsers(queryString);
    const paginate = {
      page: queryString.page ? parseInt(queryString.page) : 1,
      limit: queryString.limit ? parseInt(queryString.limit) : users.length,
      totalUsers,
      totalPages: queryString.limit ? Math.ceil(totalUsers / parseInt(queryString.limit)) : 1
    };
    res.status(200).json({
      paginate,
      users
    });
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