const db = require('../config/db');

class Stats {
  static async getDashboardCounts() {
    const [users] = await db('users').count('id as count');
    const [games] = await db('games').where('is_active', true).count('id as count');
    const [sessions] = await db('game_sessions').count('id as count');
    
    const [totalPlayTime] = await db('game_sessions').sum('play_time_seconds as total');

    return {
      totalUsers: parseInt(users.count),
      activeGames: parseInt(games.count),
      totalMatches: parseInt(sessions.count),
      totalPlayTime: parseInt(totalPlayTime.total || 0)
    };
  }

  //Lấy số lượng phiên chơi game mới trong khoảng thời gian cụ thể
  static async getDailyNewGameSessions(startDate, endDate) {
    const [result] = await db('game_sessions')
      .whereRaw('DATE(created_at) BETWEEN ? AND ?', [startDate, endDate])
      .count('id as count');
    return parseInt(result.count);
  }

  //Lấy số lượng user mới đăng ký trong khoảng thời gian cụ thể
  static async getDailyNewUsers(startDate, endDate) {
    const [result] = await db('users')
      .whereRaw('DATE(created_at) BETWEEN ? AND ?', [startDate, endDate])
      .count('id as count');
    return parseInt(result.count);
  }

  //Lấy tổng thời gian chơi game trong khoảng thời gian cụ thể
  static async getDailyTotalPlayTime(startDate, endDate) {
    const [result] = await db('game_sessions')
      .whereRaw('DATE(created_at) BETWEEN ? AND ?', [startDate, endDate])
      .sum('play_time_seconds as total');
    return parseInt(result.total || 0);
  }
}

module.exports = Stats;