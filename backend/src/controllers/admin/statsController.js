const Stats = require('../../models/Stats');

const getDashboardStats = async (req, res) => {
  try {
    const data = await Stats.getDashboardCounts();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDailyStats = async (req, res) => {
  try {
    const { date } = req.params;
    const newUsers = await Stats.getDailyNewUsers(date);
    const newGameSessions = await Stats.getDailyNewGameSessions(date);
    const totalPlayTime = await Stats.getDailyTotalPlayTime(date);
    res.json({ newUsers, newGameSessions, totalPlayTime });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats, getDailyStats };