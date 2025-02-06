const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "employee", enum : ["employee"], required: true },
    userID: { type: Number, unique: true },
    details: {
      age: { type: Number, default: null },
      phoneNo: { type: Number, default: null },
      address: { type: String, default: null },
      managerDetails: { type: mongoose.Schema.Types.ObjectId, ref: "Manager" },
    },
    //meetings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Meeting" }], 
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
