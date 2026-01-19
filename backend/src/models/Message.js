const db = require("../config/db");

class Message {
  static async create({ sender_id, receiver_id, content }) {
    const areFriends = await db("friendships")
      .where("status", "accepted")
      .andWhere(function () {
        this.where({
          user_id_1: sender_id,
          user_id_2: receiver_id,
        }).orWhere({
          user_id_1: receiver_id,
          user_id_2: sender_id,
        });
      })
      .first();

    if (!areFriends) {
      throw new Error("You can only send messages to friends");
    }

    const [message] = await db("messages")
      .insert({
        sender_id,
        receiver_id,
        content,
      })
      .returning([
        "id",
        "sender_id",
        "receiver_id",
        "content",
        "is_read",
        "created_at",
      ]);

    return message;
  }

  static async getConversation(
    currentUserId,
    otherUserId,
    { page = 1, limit = 20 }
  ) {
    if (!currentUserId || !otherUserId) {
      throw new Error("Both user IDs are required");
    }

    if (currentUserId === otherUserId) {
      throw new Error("Cannot get conversation with yourself");
    }

    const currentPage = Math.max(parseInt(page), 1);
    const perPage = Math.max(parseInt(limit), 1);
    const offset = (currentPage - 1) * perPage;

    const baseQuery = db("messages").where(function () {
      this.where({
        sender_id: currentUserId,
        receiver_id: otherUserId,
      }).orWhere({
        sender_id: otherUserId,
        receiver_id: currentUserId,
      });
    });

    const [{ count }] = await baseQuery.clone().count("* as count");

    const data = await baseQuery
      .clone()
      .orderBy("created_at", "desc")
      .offset(offset)
      .limit(perPage)
      .select(
        "id",
        "sender_id",
        "receiver_id",
        "content",
        "is_read",
        "created_at"
      );

    return {
      page: currentPage,
      limit: perPage,
      total: parseInt(count),
      totalPages: Math.ceil(count / perPage),
      data: data.reverse(),
    };
  }

  static async getConversations(userId, { page = 1, limit = 5 } = {}) {
  const currentPage = Math.max(parseInt(page), 1);
  const perPage = Math.max(parseInt(limit), 1);
  const offset = (currentPage - 1) * perPage;

  try {
    // 1. Subquery đánh số thứ tự tin nhắn theo từng cặp hội thoại
    // Sử dụng LEAST/GREATEST để đảm bảo (A,B) và (B,A) là cùng 1 cặp
    const rankedMessages = db("messages")
      .select(
        "messages.id",
        "messages.sender_id",
        "messages.receiver_id",
        "messages.content",
        "messages.created_at",
        "messages.is_read",
        db.raw(`
          ROW_NUMBER() OVER (
            PARTITION BY 
              LEAST(messages.sender_id, messages.receiver_id), 
              GREATEST(messages.sender_id, messages.receiver_id) 
            ORDER BY messages.created_at DESC, messages.id DESC
          ) as rn
        `)
      )
      .where(function() {
        this.where("messages.sender_id", userId).orWhere("messages.receiver_id", userId);
      })
      .as("rm");

    // 2. Query cơ sở để đếm tổng số cuộc hội thoại duy nhất
    const baseQuery = db.from(rankedMessages).where("rm.rn", 1);

    // 3. Đếm tổng số (Phải JOIN với users để tránh đếm user đã bị xóa)
    const countResult = await db
      .from(baseQuery.as("unique_convs"))
      .join("users", "users.id", db.raw(`
        CASE 
          WHEN unique_convs.sender_id = ? THEN unique_convs.receiver_id 
          ELSE unique_convs.sender_id 
        END
      `, [userId]))
      .count("* as total")
      .first();

    const total = parseInt(countResult?.total || 0);

    // 4. Lấy dữ liệu chi tiết và phân trang
    const conversations = await db
      .from(rankedMessages)
      .where("rm.rn", 1)
      .join("users as u", "u.id", db.raw(`
        CASE 
          WHEN rm.sender_id = ? THEN rm.receiver_id 
          ELSE rm.sender_id 
        END
      `, [userId]))
      // Join để đếm tin chưa đọc
      .leftJoin(
        db("messages")
          .select("sender_id", db.raw("COUNT(*) as unread"))
          .where({ receiver_id: userId, is_read: false })
          .groupBy("sender_id")
          .as("unread_msgs"),
        "unread_msgs.sender_id",
        "u.id"
      )
      .select(
        "u.id",
        "u.username",
        "u.avatar_url",
        "rm.content as last_message",
        "rm.sender_id as last_sender_id",
        "rm.created_at as last_time",
        db.raw("COALESCE(unread_msgs.unread, 0) as unread_count")
      )
      .orderBy("rm.created_at", "desc")
      .limit(perPage)
      .offset(offset);

    return {
      data: conversations,
      total,
      page: currentPage,
      limit: perPage,
      totalPages: Math.ceil(total / perPage),
    };
  } catch (error) {
    throw error; // Đẩy lỗi ra để Controller bắt được
  }
}

  static async countUnread(userId) {
    const [{ count }] = await db("messages")
      .where({
        receiver_id: userId,
        is_read: false,
      })
      .count("* as count");

    return parseInt(count);
  }

  static async markAsRead(currentUserId, otherUserId) {
    const updated = await db("messages")
      .where({
        sender_id: otherUserId,
        receiver_id: currentUserId,
        is_read: false,
      })
      .update({ is_read: true });

    return updated;
  }

  static async deleteMessage(messageId, userId) {
    const message = await db("messages").where({ id: messageId }).first();

    if (!message) {
      throw new Error("Message not found");
    }

    if (message.sender_id !== userId) {
      throw new Error("You can only delete your own messages");
    }

    const deleted = await db("messages").where({ id: messageId }).del();

    return deleted > 0;
  }

  static async findById(messageId) {
    return db("messages").where({ id: messageId }).first();
  }
}

module.exports = Message;
