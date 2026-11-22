const validator = require("validator");

const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;

  if (!firstName || typeof firstName !== "string" || firstName.trim().length < 2) {
    throw new Error("First name must be at least 2 characters long.");
  }

  if (lastName && typeof lastName !== "string") {
    throw new Error("Last name must be a valid string.");
  }

  if (!emailId || !validator.isEmail(emailId.trim())) {
    throw new Error("Please provide a valid email address.");
  }

  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }
};

const validateEditProfileData = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "headline",
    "photoUrl",
    "gender",
    "age",
    "about",
    "skills",
    "githubUrl",
    "linkedinUrl",
    "location",
    "lookingFor",
  ];

  const keys = Object.keys(req.body);
  if (keys.length === 0) {
    return false;
  }

  return keys.every((field) => allowedEditFields.includes(field));
};

module.exports = {
  validateSignUpData,
  validateEditProfileData,
};
