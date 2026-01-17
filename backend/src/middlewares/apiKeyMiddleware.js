const crypto = require("crypto");
require("dotenv").config();

const checkApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({
      message: "Invalid API Key.",
    });
  }

  const storedHash = process.env.API_KEY_HASH;
  if (!storedHash) {
    return res.status(500).json({
      message: "Server Error: API Key Hash not configured.",
    });
  }

  const incomingHash = crypto.createHash("sha256").update(apiKey).digest("hex");

  if (incomingHash === storedHash) {
    next();
  } else {
    return res.status(403).json({
      message: "Invalid or denied API Key.",
    });
  }
};

module.exports = checkApiKey;
