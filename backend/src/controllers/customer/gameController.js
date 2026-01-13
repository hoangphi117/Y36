const Game = require("../../models/Game");

// Lấy danh sách game
const getGames = async (req, res) => {
  try {
    const queryString = req.query;
    const games = await Game.getAllActive(queryString);
    const totalGames = await Game.countAllActive(queryString);
    const paginate = {
      page: queryString.page ? parseInt(queryString.page) : 1,
      limit: queryString.limit ? parseInt(queryString.limit) : games.length,
      totalGames,
      totalPages: queryString.limit
        ? Math.ceil(totalGames / parseInt(queryString.limit))
        : 1,
    };
    res.status(200).json({ paginate, games });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getGameById = async (req, res) => {
  try {
    const { id } = req.params;
    const game = await Game.findById(id);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }
    res.status(200).json(game);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getGames, getGameById };
