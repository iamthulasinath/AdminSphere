const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema({
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Manager",
    required: true,
  },
  details: {
    isPrivate: { type: Boolean, default: true },
    eventTitle: { type: String, required: true },
    eventDescription: { type: String },
    coverImage: { type: String },
    startDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endDate: { type: Date, required: true },
    endTime: { type: String, required: true },
    eventId: { type: String, required: false },
    eventUrl: { type: String, required: false },
    uploadFiles: [{ type: String }],
    uploadLink: { type: String },
  },
  location: {
    isOnline: { type: Boolean, default: false },
    locationLink: { type: String, required: true },
  },
  pricing: {
    isPaidService: { type: Boolean, default: true },
    price: {
      type: Number,
    },
    limitCapacity: {
      isUnlimited: { type: Boolean, default: false },
      limitUpto: { type: Number, default: 0 },
    },
    isGuestApproval: { type: Boolean, default: false },
  },
  status: {
    type: String,
    enum: ["Upcoming", "Ongoing", "Event Closed"],
    default: "Upcoming",
  },
  host: { type: String, default: "Admin" },
  createdAt: { type: Date, default: Date.now },
  attendees: [
    {
      employeeRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true,
      },
      email: { type: String, required: true },
      phoneNo: { type: String, required: true },
      amount: { type: Number, default: 0 },
      quantity: { type: Number, default: 1 },
    },
  ],
});

module.exports = mongoose.model("Events", meetingSchema);
