const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const abcRoutes = require("./routes/abc.route");
const authController = require("./controllers/auth.controller");

require("dotenv").config();
require("./cron/updateEventStatus");

app.use(express.json());
app.use(cors());
app.use("/abc", abcRoutes);

app.get("/zoom/authorize", authController.authorizeZoom);
app.get("/zoom/callback", authController.zoomCallback);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to database"))
  .catch((error) => console.error("Database connection error:", error.message));
