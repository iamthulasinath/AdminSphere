exports.validateEmail = (email) => {
  const emailRegex = /^[a-z0-9.]+@gmail\.com$/;
  return emailRegex.test(email);
};

exports.validateName = (name) => {
  const nameRegex = /^[a-zA-Z\s.]{1,100}$/;
  return nameRegex.test(name);
};

exports.validatePassword = (password) => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?]).{7,}$/;
  return passwordRegex.test(password);
};

exports.validatePhoneNumber = (phoneNo) => {
  const phoneRegex = /^\d{10}$/;
  const isValid = phoneRegex.test(phoneNo);
  if (!isValid) {
  }
  return isValid;
};
