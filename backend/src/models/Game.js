const db = require('../config/db');
const APIFeatures = require('../utils/apiFeatures');

class Game {
  static async getAll(queryString) {
    const query = db('games');

    const features = new APIFeatures(query, queryString)
      .search(['name', 'code']) // Tìm theo tên, code
      .filter()
      .sort()
      .limitFields()
      .paginate();

    return await features.query;
  }

  static async countAll(queryString) {
    const query = db('games');
    const features = new APIFeatures(query, queryString)
      .search(['name', 'code']) // Tìm theo tên, code
      .filter();
    const result = await features.query.count('id as count').first();
    return parseInt(result.count);
  }

  static async getById(id) {
    return db('games').where({ id }).first();
  }
  static async update(id, data) {
    return db('games').where({ id }).update(data).returning('*');
  }

  static async findByID(code) {
    return db('games').where({ code,is_active: true }).first(); 
  }

  static async findById(id) {
    return await db('games').where({ id }).first();
  }
}

module.exports = Game;