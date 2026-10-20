const express = require("express");
const app = express();
app.use(express.json());
const linkRoutes = require("./routes/linkRoutes");
const redirectRoutes = require("./routes/redirectRoutes");

app.get("/", (req, res) => {
  res.send("shortener is alive baby.");
});

app.use("/api", linkRoutes);

app.use("/", redirectRoutes);

module.exports = app;
