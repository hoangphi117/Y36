const express = require("express");
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;
const router = require('./routes/index');
const cors = require('cors');
const checkApiKey = require('./middlewares/apiKeyMiddleware');

app.use(cors());
app.use(express.json());

app.use('/api',checkApiKey, router);

app.get("/", (req, res) => {
  res.send("Hello mấy cưng =))");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
