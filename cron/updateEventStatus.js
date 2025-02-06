const cron = require("node-cron");
const Event = require("../models/events.model");

cron.schedule("* * * * *", async () => {
  try {
    const today = new Date();
    console.log(today);
    await Event.updateMany(
      { "details.endDate": { $lt: today } },
      { $set: { status: "Event Closed" } }
    );
    console.log("Event status updated");
  } catch (error) {
    console.error("Error updating event statuses:", error.message);
  }
});
