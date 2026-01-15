const db = require("../config/db");

class Friendship {
  static async findBetweenUsers(userId1, userId2) {
    return db("friendships")
      .where(function () {
        this.where({
          user_id_1: userId1,
          user_id_2: userId2,
        }).orWhere({
          user_id_1: userId2,
          user_id_2: userId1,
        });
      })
      .first();
  }

  static async sendFriendRequest(fromUserId, toUserId) {
    return db("friendships").insert({
      user_id_1: fromUserId,
      user_id_2: toUserId,
      status: "pending",
    });
  }

  static async acceptFriendRequest(fromUserId, toUserId) {
    return db("friendships")
      .where({
        user_id_1: fromUserId,
        user_id_2: toUserId,
        status: "pending",
      })
      .update({
        status: "accepted",
      });
  }

  static async rejectFriendRequest(fromUserId, toUserId) {
    return db("friendships")
      .where({
        user_id_1: fromUserId,
        user_id_2: toUserId,
        status: "pending",
      })
      .del();
  }

  static async unfriend(userId1, userId2) {
    return db("friendships")
      .where(function () {
        this.where({
          user_id_1: userId1,
          user_id_2: userId2,
        }).orWhere({
          user_id_1: userId2,
          user_id_2: userId1,
        });
      })
      .del();
  }

  static async blockUser(blockerId, blockedId) {
    return db("friendships")
      .where(function () {
        this.where({
          user_id_1: blockerId,
          user_id_2: blockedId,
        }).orWhere({
          user_id_1: blockedId,
          user_id_2: blockerId,
        });
      })
      .del()
      .then(() =>
        db("friendships").insert({
          user_id_1: blockerId,
          user_id_2: blockedId,
          status: "blocked",
        })
      );
  }

  static async getFriends(userId, { page = 1, limit = 10, search = "" }) {
    const currentPage = Math.max(parseInt(page), 1);
    const perPage = Math.max(parseInt(limit), 1);
    const offset = (currentPage - 1) * perPage;

    const baseQuery = db("friendships as f")
      .join("users as u", function () {
        this.on(function () {
          this.on("f.user_id_1", "=", db.raw("?", [userId])).andOn(
            "u.id",
            "=",
            "f.user_id_2"
          );
        }).orOn(function () {
          this.on("f.user_id_2", "=", db.raw("?", [userId])).andOn(
            "u.id",
            "=",
            "f.user_id_1"
          );
        });
      })
      .where("f.status", "accepted");

    if (search && search.trim()) {
      baseQuery.andWhere("u.username", "ilike", `%${search}%`);
    }

    const [{ count }] = await baseQuery.clone().count("* as count");

    const data = await baseQuery
      .clone()
      .select("u.id", "u.username", "u.avatar_url")
      .orderBy("u.username", "asc")
      .offset(offset)
      .limit(perPage);

    return {
      page: currentPage,
      limit: perPage,
      total: parseInt(count),
      data,
    };
  }
  static async getIncomingRequests(userId) {
    return db("friendships as f")
      .join("users as u", "u.id", "f.user_id_1")
      .where({
        "f.user_id_2": userId,
        "f.status": "pending",
      })
      .select("f.created_at", "u.id", "u.username", "u.avatar_url");
  }

  static async getOutgoingRequests(userId) {
    return db("friendships as f")
      .join("users as u", "u.id", "f.user_id_2")
      .where({
        "f.user_id_1": userId,
        "f.status": "pending",
      })
      .select("f.created_at", "u.id", "u.username", "u.avatar_url");
  }
}

module.exports = Friendship;
