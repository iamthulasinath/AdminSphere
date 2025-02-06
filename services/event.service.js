const Event = require("../models/events.model");

exports.createEvent = async (eventData) => {

  const event = new Event(eventData);
  await event.save();
  return event
};

exports.findEventById = async (eventId) => {
  return await Event.findOne({ _id: eventId });
};

exports.isValidEvent = async (manager, eventId) => {
  return await manager.events.some(
    (event) => event._id.toString() === eventId.toString()
  );
};

exports.isUserAlreadyRegisterEvent = async (event, email) => {
  return await event.attendees.some((attendee) => attendee.email === email);
};

exports.isValidToUpdateEvent = (manager, eventId) => {
  return manager.events.some((eve) => eve._id.toString() === eventId);
};

exports.updateEvent = async (eventId, updatedData) => {
  return await Event.findByIdAndUpdate(eventId, updatedData, {
    new: true,
    runValidators: true,
  });
};

exports.deleteEvent = async (eventId) => {
  return await Event.deleteOne({ _id: eventId });
};
