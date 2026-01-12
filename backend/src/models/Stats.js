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

  //Lấy số lượng phiên chơi game mới của từng ngày trong khoảng thời gian cụ thể và trả về list các ngày
  static async getDailyNewGameSessions(startDate, endDate) {
    const result = await db('game_sessions')
      .whereRaw('DATE(started_at) BETWEEN ? AND ?', [startDate, endDate])
    
    const dailyCounts = {};
    for (let session of result) {
      const date = session.started_at.toISOString().split('T')[0];
      if (!dailyCounts[date]) {
        dailyCounts[date] = 0;
      }
      dailyCounts[date] += 1;
    }

    return dailyCounts;
  }

  //Lấy số lượng user mới đăng ký của từng ngày trong khoảng thời gian cụ thể và trả về list các ngày
  static async getDailyNewUsers(startDate, endDate) {
    const result = await db('users')
      .whereRaw('DATE(created_at) BETWEEN ? AND ?', [startDate, endDate])

    const dailyCounts = {};
    for (let user of result) {
      const date = user.created_at.toISOString().split('T')[0];
      if (!dailyCounts[date]) {
        dailyCounts[date] = 0;
      }
      dailyCounts[date] += 1;
    }

    return dailyCounts;
  }

  //Lấy tổng thời gian chơi game của từng ngày trong khoảng thời gian cụ thể và trả về list các ngày
  static async getDailyTotalPlayTime(startDate, endDate) {
    const result = await db('game_sessions')
      .whereRaw('DATE(started_at) BETWEEN ? AND ?', [startDate, endDate])
      
    const dailyPlayTime = {};
    for (let session of result) {
      const date = session.started_at.toISOString().split('T')[0];
      if (!dailyPlayTime[date]) {
        dailyPlayTime[date] = 0;
      }
      dailyPlayTime[date] += session.play_time_seconds;
    }
    return dailyPlayTime;
  }
}

module.exports = Stats;