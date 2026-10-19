require("dotenv").config();
require("./config/db");
const PORT = process.env.PORT || 3000;
const express = require("express");
const app = express();
const linkRoutes = require("./routes/linkRoutes");
app.use(express.json());

app.get("/", (req, res) => {
  res.send("shortener is alive baby.");
});

app.use("/", linkRoutes);

app.listen(PORT, () => {
  console.log(`listening in port: ${PORT}`);
});
