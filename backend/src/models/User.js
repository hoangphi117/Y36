const db = require('../config/db');
const APIFeatures = require('../utils/apiFeatures');

class User {
  // Tìm user theo email
  static async findByEmail(email) {
    return db('users').where({ email }).first();
  }

  // Lấy danh sách user (trừ password)
  static async getAllUsers(queryString) {
    const query = db('users'); 

    const features = new APIFeatures(query, queryString)
      .search(['email', 'username']) // Tìm theo email, username
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const users = await features.query;
    // Lọc bỏ trường password
    users.forEach(user => delete user.password_hash);
    return users;
  }

  static async countAllUsers(queryString) {
    const query = db('users');

    const features = new APIFeatures(query, queryString)
      .search(['email', 'username']) // Tìm theo email, username
      .filter();
    const result = await features.query.count('id as count').first();
    return parseInt(result.count);
  }
  
  static async changeStatus(id, status) {
    return db('users').where({ id }).update({ status });
  }

  static async deleteUser(id) {
    return db('users').where({ id }).del();
  }
}

module.exports = User;