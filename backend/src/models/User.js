const db = require('../config/db');

class User {
  // Tìm user theo email
  static async findByEmail(email) {
    return db('users').where({ email }).first();
  }

  // Lấy danh sách user (trừ password)
  static async getAllUsers() {
    return db('users')
      .select('id', 'email', 'display_name', 'username', 'role', 'avatar_url', 'created_at', 'dark_mode', 'status')
      .orderBy('created_at', 'desc');
  }

  static async changeStatus(id, status) {
    return db('users').where({ id }).update({ status });
  }

  static async deleteUser(id) {
    return db('users').where({ id }).del();
  }
}

module.exports = User;