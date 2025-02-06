require("dotenv").config();
const jwt = require("jsonwebtoken");

const employeeServices = require("../services/employee.service");
const managerServices = require("../services/manager.service");

const { errorMessages } = require("../helpers/message");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: errorMessages.inValidToken });
    }
    const payload = jwt.verify(token, process.env.SECRET_KEY);

    const user =
      (await managerServices.findManagerById(payload.id)) ||
      (await employeeServices.findEmployeeById(payload.id));
    if (!user) {
      return res.status(404).json({
        error: errorMessages.unauthorizedAccess,
        details: error.message,
      });
    }

    req.user = user;

    next();
  } catch (error) {
    res
      .status(401)
      .json({ error: errorMessages.loginFirst, details: error.message });
  }
};

const isManager = async (req, res, next) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ error: errorMessages.managerOnlyAccess });
    }
    next();
  } catch (error) {
    res.status(403).json({
      error: errorMessages.unauthorizedAccess,
      details: error.message,
    });
  }
};

module.exports = { auth, isManager };
