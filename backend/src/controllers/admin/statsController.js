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
    const { startDate, endDate } = req.body;
    const newUsers = await Stats.getDailyNewUsers(startDate, endDate);
    const newGameSessions = await Stats.getDailyNewGameSessions(startDate, endDate);
    const totalPlayTime = await Stats.getDailyTotalPlayTime(startDate, endDate);
    res.json({ newUsers, newGameSessions, totalPlayTime });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats, getDailyStats };