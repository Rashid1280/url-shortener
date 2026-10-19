const express = require("express");
const router = express.Router();
const { shortenLimiter, readLimiter } = require("../middleware/rateLimiter");
const {
  shorten,
  getStats,
  redirect,
} = require("../controllers/linkController");

router.post("/shorten", shortenLimiter, shorten);
router.get("/stats/:code", readLimiter, getStats);
router.get("/:code", readLimiter, redirect);

module.exports = router;
