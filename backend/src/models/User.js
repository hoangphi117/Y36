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
  static async createUser(userData) {
    return db('users').insert(userData).returning('*');
  }

  static async findByUserName(username) {
    return db('users').where({ username }).first();
  }
  static async findById(id) {
    return db('users').where({ id }).first();
  }
  updateById(id, data) {
    return knex("users")
      .where({ id })
      .update(data)
      .returning([
        "id",
        "email",
        "username",
        "avatar_url",
        "dark_mode",
        "role",
        "status",
        "created_at",
      ]);
  }
}

module.exports = User;