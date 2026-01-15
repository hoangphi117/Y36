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
  static async updateById(id, data) {
    return db("users")
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

  static async searchUsersWithFriendStatus(currentUserId, username,limit=10,offset=0) {
    return db("users as u")
      .leftJoin("friendships as f", function () {
        this.on(function () {
          this.on("f.user_id_1", "=", db.raw("?", [currentUserId]))
            .andOn("f.user_id_2", "=", "u.id");
        }).orOn(function () {
          this.on("f.user_id_2", "=", db.raw("?", [currentUserId]))
            .andOn("f.user_id_1", "=", "u.id");
        });
      })
      .where("u.username", "ilike", `%${username}%`)
      .andWhere("u.role", "customer") 
      .andWhere("u.id", "!=", currentUserId)
      .select(
        "u.id",
        "u.username",
        "u.avatar_url",
        db.raw(
          `
          CASE
            WHEN f.status = 'accepted' THEN 'accepted'
            WHEN f.status = 'pending' AND f.user_id_1 = ? THEN 'pending_outgoing'
            WHEN f.status = 'pending' AND f.user_id_2 = ? THEN 'pending_incoming'
            WHEN f.status = 'blocked' THEN 'blocked'
            ELSE 'none'
          END AS friend_status
          `,
          [currentUserId, currentUserId]
        )
      )
      .limit(limit)
      .offset(offset);
  }

  static async countSearchUsers(currentUserId, username) {
    const result = await db("users as u")
      .where("u.username", "ilike", `%${username}%`)
      .andWhere("u.role", "customer")
      .andWhere("u.id", "!=", currentUserId)
      .count("u.id as total")
      .first();

    return parseInt(result.total);
  }
}

module.exports = User;