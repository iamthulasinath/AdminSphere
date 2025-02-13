const { AuthorizationError } = require("passport-oauth2");

module.exports = {
  errorMessages: {
    userNotFound: "User not found",
    unauthorizedAccess: "Not authorized to access",
    internalServerError: "Internal server error",
    employeeNotFound: "Employee not Found.",
    unauthorizedDelete: "Unauthorized to delete",
    managerNotFound: "Manager not found",
    noEmployees: "No employees found.",
    unauthorizedUpdate: "Unauthorized to update",
    invalidEmail:
      "Invalid email format. Only small letters, '.', and must end with @gmail.com",
    invalidName:
      "Invalid name. Only alphabets, spaces, and periods are allowed, and the length must not exceed 100 characters.",
    invalidPhoneNumber: "Invalid phone number format.",
    invalidPassword:
      "Invalid password. It must contain at least one uppercase letter, one number, one special character, and be at least 7 characters long.",
    inValidAction: "In valid action",
    requiredFieldsMissing: "Required all fields",
    cantAddManager: "You can't add a Manger",
    emailAlreadyRegistered: "Email is already registered.",
    invalidCredentials: "Invalid email or password.",
    loginFailed: "Login failed.",
    inValidToken: "Invalid Token",
    loginFirst: "Please login first.",
    managerOnlyAccess: "Only managers can access this",
    invalidRole: "Since your role is an employee, you can't register",
    managerNotFound: "Manager not found",
    userAlreadyRegistered: "User is already registered",

    cantAddMoreEmployees: "Can't add more employees !",

    invalidEmployee: "Not a valid employee",
    eventNotFound: "Event not found",

    incorrectAmount: "It is not the required amount",

    eventAccessDenied: "You do not have access to view",

    inValidEmployee: "Not a valid employee",
    callBackError: "OAuth token exchange failed",
    AuthorizationCodeMissingError: "Authorization code is missing",
  },

  successMessages: {
    OAuthsSuccessfull: "OAuth successful!",

    employeedeleted: "Employee removed successfully",
    employeesRetrived: "Employees under Supervison",
    dataUpdated: "Updated successfully",
    employeeAdded: "Employee added successfully",
    managerRegistered: "Manager registered successfully",
    loginSuccess: "Login successful",
    eventCreated: "Event created successfully",

    eventUpdated: "Event updated successfully",
    eventDeleted: "Event deleted successfully",
    eventRegistered: "Successfully registered for the event",
  },
};
