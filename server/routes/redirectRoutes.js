const express = require("express");
const router = express.Router();
const { readLimiter } = require("../middleware/rateLimiter");
const { redirect } = require("../controllers/linkController");

router.get("/:code", readLimiter, redirect);
module.exports = router;
