const express = require("express");
const app = express();
app.use(express.json());
const linkRoutes = require("./routes/linkRoutes");

app.get("/", (req, res) => {
  res.send("shortener is alive baby.");
});

app.use("/", linkRoutes);

module.exports = app;
