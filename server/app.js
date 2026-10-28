const express = require("express");
const app = express();
app.use(express.json());
const linkRoutes = require("./routes/linkRoutes");
const redirectRoutes = require("./routes/redirectRoutes");
const cors = require("cors");

app.get("/", (req, res) => {
  res.send("shortener is alive baby.");
});

app.use(
  "/api",
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    exposedHeaders: ["Retry-After"],
  }),
);

app.use("/api", linkRoutes);

app.use("/", redirectRoutes);

module.exports = app;
