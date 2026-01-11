const db = require('../config/db');

class Game {
  static async getAll() {
    return db('games').select('*').orderBy('id', 'asc');
  }

  static async getById(id) {
    return db('games').where({ id }).first();
  }

  // Cập nhật trạng thái (Enable/Disable) và Cấu hình (JSON)
  static async update(id, data) {
    return db('games').where({ id }).update(data).returning('*');
  }
}

module.exports = Game;