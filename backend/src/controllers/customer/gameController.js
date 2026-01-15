const Game = require("../../models/Game");

const getGames = async (req, res) => {
  try {
    const { search } = req.query;

    const games = await Game.getAllActive({ search });

    res.status(200).json({
      total: games.length,
      data: games,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getGameById = async (req, res) => {
  try {
    const game = await Game.findActiveById(req.params.id);

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    res.status(200).json({ data: game });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getGames, getGameById };

