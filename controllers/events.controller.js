const { successMessages, errorMessages } = require("../helpers/message");

const managerServices = require("../services/manager.service");
const employeeServices = require("../services/employee.service");
const eventServices = require("../services/event.service");
const axios = require("axios");
const base64 = require("base-64");

require("dotenv").config();

const getZoomAccessToken = async () => {
  try {
    const response = await axios.post("https://zoom.us/oauth/token", null, {
      params: {
        grant_type: "account_credentials",
        account_id: process.env.ZOOM_ACCOUNT_ID,
      },
      headers: {
        Authorization: `Basic ${base64.encode(
          `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
        )}`,
        "Content-Type": "application/json",
      },
    });
    return response.data.access_token;
  } catch (error) {
    console.error("Error fetching access token:", error.message);
    throw error;
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { details, location, pricing } = req.body;

    const manager = await managerServices.findManagerById(req.user._id);

    if (!manager) {
      return res.status(404).json({ error: errorMessages.managerNotFound });
    }

    const accessToken = await getZoomAccessToken();

    const zoomResponse = await axios.post(
      "https://api.zoom.us/v2/users/me/meetings",
      {
        type: 2,
        timezone: "Asia/Kolkata",
        password: "12345",
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          waiting_room: true,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { id, join_url } = zoomResponse.data;

    const newEvent = await eventServices.createEvent({
      details: {
        eventId: id,
        eventUrl: join_url,
        ...details,
      },
      location,
      pricing,
      manager: manager._id,
    });

    await managerServices.findManagerAndUpdateEvent(manager._id, newEvent._id);

    res.status(201).json({ message: successMessages.eventCreated });
  } catch (error) {
    res.status(500).json({
      error: errorMessages.internalServerError,
      details: error.message,
    });
  }
};

exports.registerEvent = async (req, res) => {
  try {
    const { phoneNo, email, amount, quantity } = req.body;
    const { eventId } = req.params;

    const manager = await managerServices.findManagerById(
      req.user.details.managerDetails
    );

    if (!manager) {
      return res.status(403).json({ error: errorMessages.managerNotFound });
    }

    const event = await eventServices.findEventById(eventId);

    if (!event) {
      return res.status(404).json({ error: errorMessages.eventNotFound });
    }

    const isValidEvent = await eventServices.isValidEvent(manager, eventId);

    if (!isValidEvent) {
      return res.status(403).json({ error: errorMessages.unauthorizedAccess });
    }

    const isAlreadyRegistered = await eventServices.isUserAlreadyRegisterEvent(
      event,
      email
    );

    if (isAlreadyRegistered) {
      return res
        .status(400)
        .json({ message: errorMessages.userAlreadyRegistered });
    }

    if (amount !== event.pricing.price) {
      return res.status(500).json({ error: errorMessages.incorrectAmount });
    }

    const employee = await employeeServices.findEmployeeById(req.user._id);

    event.attendees.push({
      employeeRef: employee._id,
      email,
      phoneNo,
      amount: amount,
      quantity: quantity,
    });

    await event.save();

    res.status(200).json({
      message: successMessages.eventRegistered,
    });
  } catch (error) {
    res.status(500).json({ error: errorMessages.internalServerError });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { details, pricing, location } = req.body;

    const event = await eventServices.findEventById(eventId);

    if (!event) {
      return res.status(404).json({ error: errorMessages.eventNotFound });
    }

    const manager = await managerServices.findManagerById(req.user._id);

    const isValidToUpdate = eventServices.isValidToUpdateEvent(
      manager,
      eventId
    );

    if (!manager.events || !isValidToUpdate) {
      return res.status(403).json({ error: errorMessages.unauthorizedUpdate });
    }

    await eventServices.updateEvent(eventId, { details, pricing, location });

    res.status(200).json({ message: successMessages.eventUpdated });
  } catch (error) {
    res.status(500).json({ error: errorMessages.internalServerError });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await eventServices.findEventById(eventId);

    if (!event) {
      return res.status(404).json({ error: errorMessages.eventNotFound });
    }

    const manager = await managerServices.findManagerById(event.manager);

    if (!manager || manager._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: errorMessages.unauthorizedAccess });
    }

    await managerServices.removeEvent(event.manager, eventId);

    await eventServices.deleteEvent(eventId);

    res.status(200).json({ message: successMessages.eventDeleted });
  } catch (error) {
    res.status(500).json({ error: errorMessages.internalServerError });
  }
};

exports.getEventDetails = async (req, res) => {
  try {
    const { eventId } = req.params;

    const user =
      (await employeeServices.findEmployeeById(req.user._id)) ||
      (await managerServices.findManagerById(req.user._id));

    if (!user) {
      return res.status(404).json({ error: errorMessages.userNotFound });
    }

    let manager = user;

    if (user.role === "employee") {
      manager = await managerServices.findManagerById(
        user.details.managerDetails
      );
      if (!manager) {
        return res.status(404).json({ error: errorMessages.managerNotFound });
      }
    }

    if (
      !manager.events ||
      !(await eventServices.isValidEvent(manager, eventId))
    ) {
      return res.status(403).json({ error: errorMessages.unauthorizedAccess });
    }

    let event;

    if (user.role === "employee") {
      event = await eventServices.findEventById(eventId);
    } else {
      event = await eventServices.findEventById(eventId);
    }

    if (!event) {
      return res.status(404).json({ error: errorMessages.eventNotFound });
    }

    res.status(200).json({ event });
  } catch (error) {
    res.status(500).json({ error: errorMessages.internalServerError });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const user =
      (await employeeServices.findEmployeeById(req.user._id)) ||
      (await managerServices.findManagerById(req.user._id));

    if (!user) {
      return res.status(404).json({ error: errorMessages.userNotFound });
    }

    let events = [];

    if (user.role === "employee") {
      const manager = await managerServices.findManagerById(
        user.details.managerDetails
      );
      if (!manager) {
        return res.status(404).json({ error: errorMessages.managerNotFound });
      }
      events = manager.events || [];
    } else {
      events = user.events || [];
    }

    res.status(200).json({ events });
  } catch (error) {
    res.status(500).json({ error: errorMessages.internalServerError });
  }
};
