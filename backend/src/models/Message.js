const db = require('../config/db');

class Message {
  static async create({ sender_id, receiver_id, content }) {
    const areFriends = await db('friends')
      .where(function() {
        this.where({ user_id: sender_id, friend_id: receiver_id })
          .orWhere({ user_id: receiver_id, friend_id: sender_id });
      })
      .where({ status: 'accepted' })
      .first();

    if (!areFriends) {
      throw new Error('You can only send messages to friends');
    }

    const [message] = await db('messages')
      .insert({
        sender_id,
        receiver_id,
        content,
      })
      .returning([
        'id',
        'sender_id',
        'receiver_id',
        'content',
        'is_read',
        'created_at',
      ]);
    
    return message;
  }

  static async getConversation(
    currentUserId,
    otherUserId,
    { page = 1, limit = 20 }
  ) {
    if (!currentUserId || !otherUserId) {
      throw new Error('Both user IDs are required');
    }

    if (currentUserId === otherUserId) {
      throw new Error('Cannot get conversation with yourself');
    }

    const currentPage = Math.max(parseInt(page), 1);
    const perPage = Math.max(parseInt(limit), 1);
    const offset = (currentPage - 1) * perPage;

    const baseQuery = db('messages')
      .where(function () {
        this.where({
          sender_id: currentUserId,
          receiver_id: otherUserId,
        }).orWhere({
          sender_id: otherUserId,
          receiver_id: currentUserId,
        });
      });

    const [{ count }] = await baseQuery.clone().count('* as count');

    const data = await baseQuery
      .clone()
      .orderBy('created_at', 'desc')
      .offset(offset)
      .limit(perPage)
      .select(
        'id',
        'sender_id',
        'receiver_id',
        'content',
        'is_read',
        'created_at'
      );

    return {
      page: currentPage,
      limit: perPage,
      total: parseInt(count),
      totalPages: Math.ceil(count / perPage),
      data: data.reverse(),
    };
  }

  static async getConversations(userId) {
    const subQuery = db('messages')
      .select(
        db.raw(`
          CASE
            WHEN sender_id = ? THEN receiver_id
            ELSE sender_id
          END AS other_user_id
        `, [userId]),
        db.raw('MAX(created_at) as last_time')
      )
      .where(function () {
        this.where('sender_id', userId).orWhere('receiver_id', userId);
      })
      .groupBy('other_user_id');

    return db
      .from(subQuery.as('m'))
      .join('users as u', 'u.id', 'm.other_user_id')
      .leftJoin('messages as msg', function () {
        this.on('msg.created_at', '=', 'm.last_time')
          .andOn(function () {
            this.on('msg.sender_id', '=', 'u.id')
              .orOn('msg.receiver_id', '=', 'u.id');
          });
      })
      .leftJoin(
        db('messages')
          .select('sender_id', db.raw('COUNT(*) as unread'))
          .where({ receiver_id: userId, is_read: false })
          .groupBy('sender_id')
          .as('unread_msgs'),
        'unread_msgs.sender_id',
        'u.id'
      )
      .select(
        'u.id',
        'u.username',
        'u.avatar_url',
        'msg.content as last_message',
        'msg.sender_id as last_sender_id',
        'msg.created_at as last_time',
        db.raw('COALESCE(unread_msgs.unread, 0) as unread_count')
      )
      .orderBy('m.last_time', 'desc');
  }

  static async countUnread(userId) {
    const [{ count }] = await db('messages')
      .where({
        receiver_id: userId,
        is_read: false,
      })
      .count('* as count');

    return parseInt(count);
  }

  static async markAsRead(currentUserId, otherUserId) {
    const updated = await db('messages')
      .where({
        sender_id: otherUserId,
        receiver_id: currentUserId,
        is_read: false,
      })
      .update({ is_read: true });
    
    return updated;
  }

  static async deleteMessage(messageId, userId) {
    const message = await db('messages')
      .where({ id: messageId })
      .first();

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.sender_id !== userId) {
      throw new Error('You can only delete your own messages');
    }

    const deleted = await db('messages')
      .where({ id: messageId })
      .del();

    return deleted > 0;
  }

  static async findById(messageId) {
    return db('messages')
      .where({ id: messageId })
      .first();
  }
}

module.exports = Message;