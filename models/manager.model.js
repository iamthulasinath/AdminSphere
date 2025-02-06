const mongoose = require("mongoose");

const managerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "manager", enum:["manager"], required: true },
    userID: { type: Number, unique: true },
    details: {
      age: { type: Number, default: null },
      phoneNo: { type: Number, default: null },
      address: { type: String, default: null },
    },
    employeesList: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: "Meeting" }], 
  },
  { timestamps: true }
);

module.exports = mongoose.model("Manager", managerSchema);
