const express = require("express");
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;
const router = require('./routes/index');
const cors = require('cors');
const checkApiKey = require('./middlewares/apiKeyMiddleware');
const swaggerConfig = require('./config/swagger');
const basicAuth = require('./middlewares/basicAuthMiddleware');

app.use(cors());
app.use(express.json());

app.use('/uploads',express.static("uploads"));

app.use('/api-docs', basicAuth, swaggerConfig.serve, swaggerConfig.setup);

app.use('/api',checkApiKey, router);

app.get("/", (req, res) => {
  res.send("Hello mấy cưng =))");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
})

app.use((err, req, res, next) => {
  console.error("ERROR:", err);

  res.status(err.status || 400).json({
    message: err.message || "Something went wrong",
  });
});

module.exports = app;
