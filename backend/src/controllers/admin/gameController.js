const Game = require('../../models/Game');

// Lấy danh sách game
const getGames = async (req, res) => {
  try {
    const games = await Game.getAll();
    res.json(games);
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