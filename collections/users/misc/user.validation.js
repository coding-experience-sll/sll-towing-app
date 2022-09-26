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
  dni,
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
      language &&
      dni
    )
  )
    return (error = {
      message: "Faltan campos requeridos",
      errorCode: "R003",
    });

  // validate email

  if (!(typeof email === "string" && emailValidator.validate(email)))
    return (error = {
      message: "Email invalido",
      errorCode: "R001",
    });

  // validate password

  if (!(typeof password === "string" && passwordSchema.validate(password)))
    return (error = {
      message: "Contraseña invalida, debe tener entre 4 y 16 caracteres.",
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
      message: "Telefono invalido, debe tener 10 caracteres.",
      errorCode: "R001",
    });

  // validate name

  if (!(typeof name === "string" && name.length > 2 && name.length < 50))
    return (error = {
      message: "El nombre debe tener entre 2 y 50 caracteres",
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
      message: "El apellido debe tener entre 2 y 50 caracteres",
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
        "Usuario invalido, debe tener entre 6 y 20 caracteres (minúscula)",
      errorCode: "R001",
    });

  // validate DNI

  if (
    !(
      typeof dni === "number" &&
      parseInt(dni) === dni &&
      dni.toString().length === 8
    )
  )
    return (error = {
      message: "DNI invalido, debe tener 8 caracteres.",
      errorCode: "R001",
    });

  return true;
};

module.exports = { validateRegister };
