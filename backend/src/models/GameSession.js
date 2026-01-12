const db = require('../config/db');

class GameSession {
    static async createSession(sessionData) {
        return db('game_sessions').insert(sessionData).returning('*');
    }

    static async findActiveSession(userId, gameId) {
        return db('game_sessions')
            .where({ user_id: userId, game_id: gameId, status: 'active' })
            .first();   
    }

    static async findByUser(userId) {
        return db('game_sessions')
            .where({ user_id: userId })
            .orderBy('created_at', 'desc');
    }
    static async updateById(id, data) {
        return db('game_sessions')
            .where({ id})
            .update({ 
                ...data,
                updated_at: db.fn.now()
             })
            .returning('*');
    }

    static async findById(id) {
        return db('game_sessions').where({ id }).first();
    }
}