const { SECRET_KEY, ADMIN_ID, SES_EMAIL } = require("../../config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const db = require("../../_helpers/db");
const User = db.User;
const PlayerId = db.PlayerId;
const BusinessConstants = db.BusinessConstants;
const mail = require("../../_helpers/send-email");
const ObjectId = require("mongodb").ObjectId;
const secret = SECRET_KEY;
const { uploadFile } = require("../../_helpers/s3");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const path = require("path");
const subWeeks = require("date-fns/subWeeks");

module.exports = {
  authenticate,
  getUserId,
  getTokenDecoded,
  retrieveUser,
  create,
  editInfo,
  editProfilePicture,
  getUserDevices,
  resendVerify,
  verifyEmail,
  forgotPasswordRequest,
  forgotPasswordTokenOnly,
  forgotPasswordUpdate,
  changePassword,
  toggleOverlappingApps,
  toggleDoNotDisturb,
  userMetrics,
  getDND,
  deleteUser,
  getAll,
  getById,
};

//LOGIN

async function authenticate({ email, password }) {
  const user = await User.findOne({ email });
  const jwtConstant = await BusinessConstants.findOne({ name: "jwtDuration" }); //token duration is stored in a constant

  let jwtDuration;

  if (jwtConstant) jwtDuration = `${jwtConstant.value}d`;
  else jwtDuration = "90d";

  if (user && bcrypt.compareSync(password, user.hash)) {
    if (!user.verified) {
      return { verified: user.verified };
    }

    const token = jwt.sign({ sub: user.id }, secret, {
      expiresIn: jwtDuration,
    });
    return {
      ...user.toJSON(),
      token,
    };
  }
}

//retrieve user ID

async function getUserId(token) {
  let userId = "";

  if (token) {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        throw "error: " + err;
      } else {
        userId = decoded.sub;
      }
    });
  }

  return userId;
}

//retrieve user ID and token expiration

async function getTokenDecoded(token) {
  let userId = "";
  let exp;

  if (token) {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        throw "error: " + err;
      } else {
        exp = decoded.exp;
        userId = decoded.sub;
      }
    });
  }

  return {
    userId,
    exp,
  };
}

//retrieveUser extracts the user's data from the token, which has the user ID and the token expiration date embedded in it.

async function retrieveUser(token) {
  let id = "";
  let user = "";
  if (token) {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        throw "error";
      } else {
        id = decoded.sub;
      }
    });
    user = await User.findOne({ _id: ObjectId(id) });
  }
  return user;
}

//GENERATE TOKENS (not authentication tokens, verify email and forgot pw tokens)
function randomTokenString() {
  return crypto.randomBytes(2).toString("hex");
}

//REGISTER
async function create(userParam) {
  const existing = await User.findOne({
    $or: [
      { email: userParam.email },
      { phone: userParam.phone },
      { dni: userParam.dni },
    ],
  });

  if (existing) {
    let repeatedParam;
    if (existing.email == userParam.email) repeatedParam = "Email";
    else if (existing.phone == userParam.phone) repeatedParam = "Telefono";
    else repeatedParam = "DNI";
    return (error = {
      message: `${repeatedParam} en uso`,
      errorCode: "R002",
    });
  }

  const user = new User({
    ...userParam,
    createdAt: Date.now(),
  });

  if (userParam.password) {
    user.hash = bcrypt.hashSync(userParam.password, 10);
  }

  user.verificationToken = randomTokenString();

  const mailOptions = {
    from: SES_EMAIL,
    to: user.email,
    subject: `GruOut: Verificación de cuenta`,
    token: user.verificationToken,
    templateH1: `verificación`,
    templateText: "verificar tu correo electrónico",
  };

  await user.save();

  mail.send(mailOptions);

  return { ...user.toJSON() };
}

//edit user info (not profile picture)

async function editInfo(userId, changes) {
  if (changes.password)
    throw "The password cannot be modified with this method. Please use the dedicated function for that.";

  const user = await User.findOneAndUpdate(
    { _id: userId },
    { $set: changes },
    (err, user) => {
      if (err) throw err;
      return user;
    }
  );
  return user;
}

//edit user profile picture

async function editProfilePicture(userId, file) {
  const user = await User.findById(userId);

  if (!user) throw "Invalid user ID.";

  const ext = path.parse(file.originalname).ext;

  //if there was a previous picture, it's replaced
  let updatedPath = `users/${file.filename}${ext}`;

  //creates a new path using the previous file's name and the new file's extension
  if (user.profilePicture) {
    const noExt = path.parse(user.profilePicture).name;
    updatedPath = `users/${noExt}${ext}`;
  }

  //uploads the new picture then deletes the local file
  const uploadedPicture = await uploadFile(file, updatedPath);

  await unlinkFile(file.path);

  const pfpKey = uploadedPicture.Key.slice(6);

  user.profilePicture = pfpKey;

  await user.save();

  return user;
}

//get user devices for notifications

async function getUserDevices(userId) {
  const playerIds = await PlayerId.find({ user: userId });

  if (!playerIds) throw "There are no devices linked to that user.";

  const mappedIds = playerIds.map((playerId) => playerId.playerId);

  return mappedIds;
}

//VERIFY EMAIL, RESEND VERIFY

async function resendVerify({ emailParam }) {
  const user = await db.User.findOne({ email: emailParam });

  if (!user)
    return (error = {
      message: `Usuario no encontrado`,
      errorCode: "R004",
    });

  if (user.verified) return { verified: user.verified };

  user.verificationToken = randomTokenString();

  const mailOptions = {
    from: SES_EMAIL,
    to: user.email,
    subject: `GruOut: Verificación de cuenta (reenvío)`,
    token: user.verificationToken,
    templateH1: `verificación`,
    templateText: "verificar tu correo electrónico",
  };

  mail.send(mailOptions);

  await user.save();

  return { message: "Email de verificación reenviado por mail" };
}

async function verifyEmail({ token }) {
  const user = await db.User.findOne({ verificationToken: token });

  const jwtConstant = await BusinessConstants.findOne({ name: "jwtDuration" });

  let jwtDuration;

  if (jwtConstant) jwtDuration = `${jwtConstant.value}d`;
  else jwtDuration = "90d";

  if (!user) throw "Usuario no encontrado / token invalido";

  user.verified = true;
  user.verificationToken = undefined;

  await user.save();

  const jwtToken = jwt.sign({ sub: user.id }, secret, {
    expiresIn: jwtDuration,
  });

  return {
    ...user.toJSON(),
    jwtToken,
  };
}

//FORGOT PW

async function forgotPasswordRequest({ email }) {
  const user = await db.User.findOne({ email: email });
  if (!user) throw "user not found";

  user.forgotPwToken = randomTokenString();

  const mailOptions = {
    from: SES_EMAIL,
    to: user.email,
    subject: `GruOut: Recuperación de contraseña`,
    token: user.forgotPwToken,
    templateH1: `recuperación de contraseña`,
    templateText: "recuperar tu contraseña",
  };

  mail.send(mailOptions);

  await user.save();
}

async function forgotPasswordTokenOnly(userParam) {
  if (!userParam.token) throw "Please, provide a verification token.";

  const user = await db.User.findOne({ forgotPwToken: userParam.token });

  if (!user) throw "Usuario no encontrado/token invalido";

  return;
}

async function forgotPasswordUpdate(userParam) {
  //validation that it shouldnt be the previous pw
  const user = await db.User.findOne({ forgotPwToken: userParam.token });

  if (!user) throw "Usuario no encontrado/token invalido";

  if (userParam.pw != userParam.confirmPw) throw "passwords do not match";

  if (userParam.pw) {
    user.hash = bcrypt.hashSync(userParam.pw, 10);
  }
  user.forgotPwToken = undefined;

  await user.save();
}

// CHANGE PW

async function changePassword(token, userParam) {
  const userId = await getUserId(token);

  const user = await db.User.findOne({ _id: userId });

  if (!user) throw "user not found";

  if (userParam.pw != userParam.confirmPw) throw "passwords do not match";

  if (!bcrypt.compareSync(userParam.currentPw, user.hash))
    throw "The current password is invalid.";

  if (userParam.pw) {
    user.hash = bcrypt.hashSync(userParam.pw, 10);
  }

  await user.save();
}

async function toggleOverlappingApps(userId) {
  //user must turn this on to receive/generate payments
  const user = await User.findById(userId);

  if (!user) throw "Invalid user ID.";

  user.overlappingApps
    ? (user.overlappingApps = false)
    : (user.overlappingApps = true);

  await user.save();

  return user;
}

async function toggleDoNotDisturb(userId) {
  //prevents the user from receiving notifications
  const user = await User.findById(userId);

  if (!user) throw "Invalid user ID.";

  user.doNotDisturb ? (user.doNotDisturb = false) : (user.doNotDisturb = true);

  await user.save();

  return user;
}

async function userMetrics(userId) {
  //metrics for the admin panel
  if (userId != ADMIN_ID) throw "You do not have admin privileges.";

  const users = await User.find();

  if (!users) throw "There are no users yet.";

  let newUsers = 0,
    dndUsers = 0,
    byNationality = [];

  users.forEach((user) => {
    if (user.createdAt > subWeeks(Date.now(), 1)) newUsers++;

    if (user.doNotDisturb) dndUsers++;

    const index = byNationality.findIndex(
      (n) => n.nationality == user.nationality
    );

    if (index > -1) {
      byNationality[index].amount++;
    } else {
      byNationality.push({
        nationality: user.nationality,
        amount: 1,
      });
    }
  });

  return {
    newUsers,
    dndUsers,
    byNationality,
  };
}

async function getDND(userId) {
  if (userId != ADMIN_ID) throw "You do not have admin privileges.";

  const users = await User.find({ doNotDisturb: true });

  return users;
}

async function deleteUser(adminId, id) {
  if (adminId != ADMIN_ID) throw "You do not have admin privileges.";

  const user = await User.deleteOne({ _id: id });

  return user;
}

async function getAll() {
  return await User.find();
}

//to use this function, copy and paste the user's id in the request path
async function getById(id) {
  //add exception for invalid id
  return await User.findById(id);
}
