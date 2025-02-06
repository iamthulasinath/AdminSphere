const Employee = require("../models/employee.model");

exports.findEmployeeById = async (id) => {
  return await Employee.findOne({ _id: id });
};

exports.findEmployeeByEmail = async (email) => {
  return await Employee.findOne({ email: email });
};

exports.createEmployee = async ({name,email,hashedPassword,role,employeeID,manager}) => {
  const employee = new Employee({
    name,
    email,
    password: hashedPassword,
    role: role,
    userID: employeeID,
    details: {
      managerDetails: manager._id,
    },
  });
  const savedEmployee = await employee.save();
  manager.employeesList.push(savedEmployee._id);
  await manager.save();
  return savedEmployee;
};

exports.deleteEmployee = async (id) => {
  return await Employee.deleteOne({ _id: id });
};

exports.updateEmployee = async (id, updateData) => {
  return await Employee.findOneAndUpdate(
    { _id: id },
    { $set: updateData },
    { new: true }
  );
};

exports.getEmployeesUnderManager = async (manager) => {
  const employeeIDs = manager.employeesList.map((e) => e._id);
  return await Employee.find({ _id: { $in: employeeIDs } });
};

exports.findEmployeeAndUpdate = async (employeeId, updateQuery) => {
  return await Employee.findOneAndUpdate(
    { _id: employeeId },
    { $set: updateQuery },
    { new: true }
  );
};

exports.isMyEmployee = async (managerId, employeeId) => {
  return await Employee.findOne({
    _id: employeeId,
    "details.managerDetails": managerId,
  });
};
