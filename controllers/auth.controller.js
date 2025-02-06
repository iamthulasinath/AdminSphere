require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { errorMessages, successMessages } = require("../helpers/message");
const {
  validateEmail,
  validateName,
  validatePassword,
} = require("../helpers/validators");

const managerServices = require("../services/manager.service");
const employeeServices = require("../services/employee.service");

exports.register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (role === "employee") {
      return res.status(400).json({ error: errorMessages.invalidRole });
    }

    if (!email || !password || !name || !role) {
      return res
        .status(400)
        .json({ error: errorMessages.requiredFieldsMissing });
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

    const existingManager = await managerServices.findManagerByEmail(email);
    if (existingManager) {
      return res
        .status(400)
        .json({ error: errorMessages.emailAlreadyRegistered });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newManager = managerServices.createManager({
      name,
      email,
      password: hashedPassword,
      userID: Math.floor(1000000 + Math.random() * 9000000),
    });

    res.status(201).json({
      message: successMessages.managerRegistered,
      userID: newManager.userID,
    });
  } catch (error) {
    res.status(500).json({
      error: errorMessages.internalServerError,
      details: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(404)
        .json({ error: errorMessages.requiredFieldsMissing });
    }
    const user =
      (await managerServices.findManagerByEmail(email)) ||
      (await employeeServices.findEmployeeByEmail(email));

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: errorMessages.invalidCredentials });
    }
    const jwtToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY);
    res
      .status(200)
      .json({ message: successMessages.loginSuccess, JWTTOKEN: jwtToken });
  } catch (error) {
    res
      .status(500)
      .json({ error: errorMessages.loginFailed, details: error.message });
  }
};
