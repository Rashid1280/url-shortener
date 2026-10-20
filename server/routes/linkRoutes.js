const express = require("express");
const router = express.Router();
const { shortenLimiter, readLimiter } = require("../middleware/rateLimiter");
const { shorten, getStats } = require("../controllers/linkController");

router.post("/shorten", shortenLimiter, shorten);
router.get("/stats/:code", readLimiter, getStats);

module.exports = router;
