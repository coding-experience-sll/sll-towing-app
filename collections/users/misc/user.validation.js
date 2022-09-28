const emailValidator = require("email-validator");
const passwordValidator = require("password-validator");
const passwordSchema = new passwordValidator();

passwordSchema
  .is()
  .min(4) // Minimum length 8
  .is()
  .max(16) // Maximum length 100
  // .has()
  // .uppercase() // Must have uppercase letters
  // .has()
  // .lowercase() // Must have lowercase letters
  // .has()
  // .digits() // Must have at least 2 digits
  .has()
  .not()
  .spaces(); // Should not have spaces
//.is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values

const validateRegister = ({
  email,
  password,
  username,
  name,
  lastName,
  phone,
  nationality,
  language,
}) => {
  // validate missing fields

  if (
    !(
      email &&
      password &&
      username &&
      name &&
      lastName &&
      phone &&
      nationality &&
      language
    )
  )
    return (error = {
      message: "Missing required fields.",
      errorCode: "R003",
    });

  // validate email

  if (!(typeof email === "string" && emailValidator.validate(email)))
    return (error = {
      message: "Invalid email.",
      errorCode: "R001",
    });

  // validate password

  if (!(typeof password === "string" && passwordSchema.validate(password)))
    return (error = {
      message: "Invalid password. Must have between 4 and 16 characters.",
      errorCode: "R001",
    });

  // validate phone number

  if (
    !(
      typeof phone === "number" &&
      parseInt(phone) === phone &&
      phone.toString().length === 10
    )
  )
    return (error = {
      message: "Invalid phone. Must have 10 characters.",
      errorCode: "R001",
    });

  // validate name

  if (!(typeof name === "string" && name.length > 2 && name.length < 50))
    return (error = {
      message: "The name must have between 2 and 50 characters.",
      errorCode: "R001",
    });

  // validate last name

  if (
    !(
      typeof lastName === "string" &&
      lastName.length > 2 &&
      lastName.length < 30
    )
  )
    return (error = {
      message: "The last name must have between 2 and 50 characters.",
      errorCode: "R001",
    });

  // validate username

  const userNamePattern = /^[a-z0-9]+$/;
  if (
    !(
      typeof username === "string" &&
      username.length >= 6 &&
      username.length <= 20 &&
      userNamePattern.test(username)
    )
  )
    return (error = {
      message:
        "Invalid user, must have between 6 and 20 characters.",
      errorCode: "R001",
    });

  return true;
};

module.exports = { validateRegister };
