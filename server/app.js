const express = require("express");
const app = express();
app.set("trust proxy", 3);
app.use(express.json());
const linkRoutes = require("./routes/linkRoutes");
const redirectRoutes = require("./routes/redirectRoutes");
const cors = require("cors");
const mongoose = require("mongoose");

app.get("/health", (req, res) => {
  const dbUp = mongoose.connection.readyState === 1; // 0 off, 1 connected, 2 connecting, 3 disconnecting
  res.status(dbUp ? 200 : 503).json({ status: dbUp ? "ok" : "db down" });
});

//temp: to check the no. of proxy on render
app.get("/ip-debug", (req, res) => {
  res.json({
    "req.ip": req.ip,
    "x-forwarded-for": req.headers["x-forwarded-for"],
    socket: req.socket.remoteAddress,
  });
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

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON body" });
  }
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server" });
});

module.exports = app;
