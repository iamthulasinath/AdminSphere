const express = require("express");
const router = express.Router();
const {
  getDetails,
  deleteEmployee,
  updateDetails,
  addEmployee,
  viewEmployeesUnderManager,
} = require("../controllers/abc.controller");
const { auth, isManager } = require("../middleware/auth");
const {
  createEvent,
  registerEvent,
  updateEvent,
  deleteEvent,
  getEventDetails,
  getEvents,
} = require("../controllers/events.controller");
const { register, login } = require("../controllers/auth.controller");

router.post("/login", login);
router.post("/register", register);

router.post("/add-employee", auth, isManager, addEmployee);

router.get("/get-details/:id", auth, getDetails);
router.get("/get-my-employees", auth, isManager, viewEmployeesUnderManager);

router.put("/update-details/:id", auth, updateDetails);

router.delete("/delete-employee/:id", auth, isManager, deleteEmployee);

router.post("/create-event", auth, isManager, createEvent);
router.post("/register-event/:eventId", auth, registerEvent);

router.get("/get-event/:eventId", auth, getEventDetails);
router.get("/get-events", auth, isManager, getEvents);

router.put("/update-event/:eventId", auth, isManager, updateEvent);

router.delete("/delete-event/:eventId", auth, isManager, deleteEvent);

module.exports = router;
