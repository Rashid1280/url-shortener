require("dotenv").config();
require("./config/db");
const PORT = process.env.PORT || 3000;
const express = require("express");
const app = express();
const { shortenLimiter, readLimiter } = require("./middleware/rateLimiter");
const { shorten, getStats, redirect } = require("./controllers/linkController");
app.use(express.json());

app.get("/", (req, res) => {
  res.send("shortener is alive baby.");
});

app.post("/shorten", shortenLimiter, shorten);
app.get("/stats/:code", readLimiter, getStats);
app.get("/:code", readLimiter, redirect);

app.listen(PORT, () => {
  console.log(`listening in port: ${PORT}`);
});
