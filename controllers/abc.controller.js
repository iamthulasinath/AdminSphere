const { errorMessages, successMessages } = require("../helpers/message");
const bcrypt = require("bcryptjs");

const employeeServices = require("../services/employee.service");
const managerServices = require("../services/manager.service");

const {
  validateEmail,
  validateName,
  validatePassword,
  validatePhoneNumber,
} = require("../helpers/validators");

exports.getDetails = async (req, res) => {
  try {
    const loggedUser = req.user;
    const userDetails =
      (await employeeServices.findEmployeeById(req.params.id)) ||
      (await managerServices.findManagerById(req.params.id));

    if (!userDetails) {
      return res.status(404).json({ error: errorMessages.userNotFound });
    }

    if (loggedUser._id.toString() === userDetails._id.toString()) {
      return res.status(200).json(userDetails);
    }

    if (loggedUser.role === "manager") {
      const isMyEmployee = await employeeServices.isMyEmployee(
        loggedUser._id,
        req.params.id
      );

      if (isMyEmployee) {
        return res.status(200).json(userDetails);
      }
    }

    return res.status(403).json({ error: errorMessages.unauthorizedAccess });
  } catch (error) {
    res.status(500).json({
      error: errorMessages.internalServerError,
      details: error.message,
    });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await employeeServices.findEmployeeById(req.params.id);

    if (!employee) {
      return res.status(404).json({ error: errorMessages.employeeNotFound });
    }

    const manager = await managerServices.findManagerById(req.user._id);

    if (!manager) {
      return res.status(404).json({ error: errorMessages.managerNotFound });
    }

    const isEmployeeInList = await managerServices.isEmployeeInList(
      manager,
      employee._id
    );

    if (!isEmployeeInList) {
      return res.status(403).json({ error: errorMessages.unauthorizedDelete });
    }

    manager.employeesList = managerServices.updatedEmployeesList(
      manager,
      employee._id
    );

    await managerServices.saveManager(manager);

    await employeeServices.deleteEmployee(req.params.id);

    res.status(200).json({ message: successMessages.employeedeleted });
  } catch (error) {
    res.status(500).json({
      error: errorMessages.internalServerError,
      details: error.message,
    });
  }
};

exports.viewEmployeesUnderManager = async (req, res) => {
  try {
    const manager = await managerServices.findManagerById(req.user.id);

    if (!manager) {
      return res.status(404).json({ error: errorMessages.managerNotFound });
    }

    if (!manager.employeesList || manager.employeesList.length === 0) {
      return res.status(200).json({ message: errorMessages.noEmployees });
    }

    const employees = await employeeServices.getEmployeesUnderManager(manager);

    return res.status(200).json({
      message: successMessages.employeesRetrived,
      employees,
    });
  } catch (error) {
    return res.status(500).json({
      error: errorMessages.internalServerError,
      details: error.message,
    });
  }
};

exports.updateDetails = async (req, res) => {
  try {
    const requestedUser =
      (await employeeServices.findEmployeeById(req.params.id)) ||
      (await managerServices.findManagerById(req.params.id));

    if (!requestedUser) {
      return res.status(404).json({ error: errorMessages.userNotFound });
    }

    const loggedUser =
      (await managerServices.findManagerById(req.user._id)) ||
      (await employeeServices.findEmployeeById(req.user._id));

    if (!loggedUser) {
      return res.status(404).json({ error: errorMessages.userNotFound });
    }

    const isSelfUpdate =
      loggedUser._id.toString() === requestedUser._id.toString();
    const isManagerEditingEmployee =
      loggedUser.role === "manager" &&
      requestedUser.role === "employee" &&
      requestedUser.details.managerDetails.toString() ===
        loggedUser._id.toString();

    if (!isSelfUpdate && !isManagerEditingEmployee) {
      return res.status(403).json({ error: errorMessages.unauthorizedUpdate });
    }

    if (req.body.email && !validateEmail(req.body.email)) {
      return res.status(400).json({ error: errorMessages.invalidEmail });
    }
    if (req.body.name && !validateName(req.body.name)) {
      return res.status(400).json({ error: errorMessages.invalidName });
    }
    if (req.body.password && !validatePassword(req.body.password)) {
      return res.status(400).json({ error: errorMessages.invalidPassword });
    }
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    if (
      req.body.details.phoneNo &&
      !validatePhoneNumber(req.body.details.phoneNo)
    ) {
      return res.status(400).json({ error: errorMessages.invalidPhoneNumber });
    }

    if (loggedUser.role === "employee" && req.body.userID) {
      return res.status(403).json({ error: errorMessages.inValidAction });
    }

    const updateQuery = {};
    if (req.body.name) updateQuery.name = req.body.name;
    if (req.body.email) updateQuery.email = req.body.email;
    if (req.body.password) updateQuery.password = req.body.password;
    if (req.body.details) {
      for (const key in req.body.details) {
        updateQuery[`details.${key}`] = req.body.details[key];
      }
    }

    const updatedUser =
      (await employeeServices.findEmployeeAndUpdate(
        req.params.id,
        updateQuery
      )) ||
      (await managerServices.findManagerAndUpdateDetails(
        req.params.id,
        updateQuery
      ));

    if (!updatedUser) {
      return res.status(404).json({ error: errorMessages.userNotFound });
    }

    return res
      .status(200)
      .json({ message: successMessages.dataUpdated, updatedUser });
  } catch (error) {
    res.status(500).json({
      error: errorMessages.internalServerError,
      details: error.message,
    });
  }
};

exports.addEmployee = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({
        error: errorMessages.requiredFieldsMissing,
      });
    }

    if (role === "manager") {
      return res.status(400).json({
        error: errorMessages.cantAddManager,
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        error: errorMessages.invalidEmail,
      });
    }

    if (!validateName(name)) {
      return res.status(400).json({
        error: errorMessages.invalidName,
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        error: errorMessages.invalidPassword,
      });
    }

    const manager = await managerServices.findManagerById(req.user._id);

    if (!manager) {
      return res.status(404).json({
        error: errorMessages.managerNotFound,
      });
    }

    if (manager.employeesList.length >= 10) {
      return res.status(400).json({
        message: errorMessages.cantAddMoreEmployees,
      });
    }
    const existingEmployee = await employeeServices.findEmployeeByEmail(email);
    if (existingEmployee) {
      return res.status(400).json({
        error: errorMessages.emailAlreadyRegistered,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const employeeID = Math.floor(1000000 + Math.random() * 9000000);

    const newEmployee = await employeeServices.createEmployee({
      name,
      email,
      role,
      hashedPassword,
      employeeID,
      manager,
    });

    res.status(201).json({
      message: successMessages.employeeAdded,
    });
  } catch (error) {
    res.status(500).json({
      error: errorMessages.internalServerError,
      details: error.message,
    });
  }
};
