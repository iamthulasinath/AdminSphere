const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
require("./cron/updateEventStatus");
const app = express();

const abcRoutes = require("./routes/abc.route");

app.use(express.json());
app.use("/abc", abcRoutes);

const PORT = process.env.PORT;

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
