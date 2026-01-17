const Game = require('../../models/Game');
const GameRating = require('../../models/GameRating');

// Lấy danh sách game
const getGames = async (req, res) => {
  try {
    const queryString = req.query;
    const games = await Game.getAll(queryString);
    const totalGames = await Game.countAll(queryString);
    // Lấy rating trung bình cho mỗi game
    for (const game of games) {
      game.rating = await GameRating.getRating(game.id);
    }
    const paginate = {
      page: queryString.page ? parseInt(queryString.page) : 1,
      limit: queryString.limit ? parseInt(queryString.limit) : games.length,
      totalGames,
      totalPages: queryString.limit ? Math.ceil(totalGames / parseInt(queryString.limit)) : 1
    };
    res.status(200).json({ paginate,  games });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật Game (Bật/Tắt, Sửa default_config)
const updateGame = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active, default_config } = req.body;
    
    // Prepare data object
    const updateData = {};
    if (is_active !== undefined) updateData.is_active = is_active;
    if (default_config) updateData.default_config = default_config; // Knex tự xử lý JSONB

    const updatedGame = await Game.update(id, updateData);
    res.json(updatedGame);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getGames, updateGame };