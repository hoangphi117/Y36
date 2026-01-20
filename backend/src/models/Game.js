const db = require('../config/db');
const APIFeatures = require('../utils/APIFeatures');

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

  static async getAllActive({ search }) {
    const query = db("games");
    if (search) {
      query.andWhere((qb) => {
        qb.whereILike("name", `%${search}%`)
          .orWhereILike("code", `%${search}%`);
      });
    }

    return query.orderBy("created_at", "desc");
  }

  static async findActiveById(id) {
    return db("games")
      .where({ id, is_active: true })
      .first();
  }

  static async findByCode(code) {
    return db("games")
      .where({ code, is_active: true })
      .first();
  }
}

module.exports = Game;