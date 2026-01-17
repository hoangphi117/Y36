const db = require("../config/db");

class Comment {
  static tableName = "comments";
  static async create({ user_id, game_id, content }) {
    const [comment] = await db(this.tableName)
      .insert({
        user_id,
        game_id,
        content,
      })
      .returning("*");

    return comment;
  }

  static async findByGameId(game_id, { page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;

    const [comments, [{ count }]] = await Promise.all([
      db(this.tableName)
        .where("comments.game_id", game_id)
        .join("users", "comments.user_id", "users.id")
        .select(
          "comments.id",
          "comments.content",
          "comments.created_at",
          "comments.updated_at",
          "users.id as user_id",
          "users.username",
          "users.avatar_url",
        )
        .orderBy("comments.created_at", "desc")
        .limit(limit)
        .offset(offset),

      db(this.tableName).where({ game_id }).count("id as count"),
    ]);

    return {
      comments,
      total: Number(count),
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  static async findById(id) {
    return db(this.tableName).where({ id }).first();
  }

  static async updateById(id, content) {
    const [comment] = await db(this.tableName).where({ id }).update(
      {
        content,
        updated_at: db.fn.now(),
      },
      "*",
    );

    return comment;
  }

  static async deleteById(id) {
    return db(this.tableName).where({ id }).del();
  }
}

module.exports = Comment;
