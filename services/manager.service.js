const Manager = require("../models/manager.model");

exports.findManagerById = async (id) => {
  return await Manager.findOne({ _id: id });
};

exports.updateManager = async (id, updateData) => {
  return await Manager.findOneAndUpdate(
    { _id: id },
    { $set: updateData },
    { new: true }
  );
};

exports.saveManager = async (manager) => {
  return await manager.save();
};

exports.isEmployeeInList = async (manager, employeeId) => {
  return await manager.employeesList.some(
    (emp) => emp._id.toString() === employeeId.toString()
  );
};

exports.updatedEmployeesList = (manager, employeeId) => {
  return manager.employeesList.filter(
    (emp) => emp._id.toString() !== employeeId.toString()
  );
};

exports.findManagerAndUpdateDetails = async (managerId, updateQuery) => {
  return await Manager.findOneAndUpdate(
    { _id: managerId },
    { $set: updateQuery },
    { new: true }
  );
};

exports.findManagerByEmail = async (email) => {
  return await Manager.findOne({ email: email });
};

exports.createManager = async (managerData) => {
  const manager = new Manager(managerData);
  return await manager.save();
};

exports.findManagerAndUpdateEvent = async (managerId, eventId) => {
  return await Manager.findByIdAndUpdate(managerId, {
    $push: { events: eventId },
  });
};

exports.removeEvent = async (managerId, eventId) => {
  return await Manager.findByIdAndUpdate(managerId, {
    $pull: { events: eventId },
  });
};
