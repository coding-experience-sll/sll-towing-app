const passwordValidator = require("password-validator");

const validateCreation = ({ type, model, plateNumber, year, color }) => {
  if (!(type && model && plateNumber && year && color))
    return (error = {
      message: "Missing required fields.",
      errorCode: "R003",
    });

  return true;
};

module.exports = { validateCreation };
