const express = require("express");
const router = express.Router();
const userService = require("./user.service");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { validateRegister } = require("./misc/user.validation");

// routes
router.post("/addPlayerId", addPlayerId);
router.post("/authenticate", authenticate);
router.get("/retrieveUser", retrieveUser);
router.post("/register", register);
router.put("/editInfo", editInfo);
router.post("/editProfilePicture", upload.single("pfp"), editProfilePicture);
router.get("/userMetrics", userMetrics);
router.post("/resendVerify", resendVerify);
router.post("/verifyEmail", verifyEmail);
router.post("/forgotPasswordRequest", forgotPasswordRequest);
router.post("/forgotPasswordTokenOnly", forgotPasswordTokenOnly);
router.put("/forgotPasswordUpdate", forgotPasswordUpdate);
router.put("/changePassword", changePassword);
router.put("/toggleOverlappingApps", toggleOverlappingApps);
router.put("/toggleDoNotDisturb", toggleDoNotDisturb);
router.get("/getDND", getDND);
router.delete("/deleteUser/:id", deleteUser);

//GET APIs
router.get("/", getAll);
router.get("/:id", getById);

module.exports = router;

function addPlayerId(req, res, next) {
  userService
    .addPlayerId(req.user.sub)
    .then((user) =>
      user
        ? res.status(200).json(user)
        : res.status(400).json({ message: "Could not add the player ID." })
    )
    .catch((err) => next(err));
}

//REGISTER, LOGIN

function authenticate(req, res, next) {
  userService
    .authenticate(req.body)
    .then((user) =>
      user
        ? res.json(user)
        : res.status(400).json({ message: "Usuario o contraseña incorrectos" })
    )
    .catch((err) => next(err));
}

function retrieveUser(req, res, next) {
  userService
    .retrieveUser(req.headers.authorization.split(" ")[1])
    .then((user) =>
      user
        ? res.json(user)
        : res
            .status(400)
            .json({ message: "Unable to retrieve user data via token." })
    )
    .catch((err) => next(err));
}

function register(req, res, next) {
  try {
    const validBody = validateRegister(req.body);
    if (validBody.errorCode) {
      res.status(400).json(validBody);
      return;
    }
    userService
      .create(req.body)
      .then((user) =>
        user && !user.errorCode ? res.json(user) : res.status(400).json(user)
      )
      .catch((err) => next(err));
  } catch (err) {
    next(err);
  }
}

//edit user info (not profile picture)
function editInfo(req, res, next) {
  userService
    .editInfo(req.user.sub, req.body)
    .then((user) =>
      user
        ? res.status(200).json(user)
        : res
            .status(400)
            .json({
              message: "No se pudo actualizar la información del perfil",
            })
    )
    .catch((err) => next(err));
}

//edit user info (not profile picture)
function editProfilePicture(req, res, next) {
  const file = req.file;
  userService
    .editProfilePicture(req.user.sub, file)
    .then((user) =>
      user
        ? res.status(200).json(user)
        : res
            .status(400)
            .json({ message: "Could not upload the profile picture." })
    )
    .catch((err) => next(err));
}

function resendVerify(req, res, next) {
  userService
    .resendVerify(req.body)
    .then((resent) =>
      !resent.errorCode ? res.json(resent) : res.status(400).json(resent)
    )
    .catch(next);
}

//VERIFY EMAIL

function verifyEmail(req, res, next) {
  userService
    .verifyEmail(req.body)
    .then((user) =>
      user
        ? res.json(user)
        : res
            .status(404)
            .json({ message: "Usuario no encontrado/token invalido" })
    )
    .catch(next);
}

//FORGET PW

function forgotPasswordRequest(req, res, next) {
  userService
    .forgotPasswordRequest(req.body)
    .then(() => res.json({ message: "Token de recuperación enviado por mail" }))
    .catch(next);
}

function forgotPasswordTokenOnly(req, res, next) {
  userService
    .forgotPasswordTokenOnly(req.body)
    .then(() => res.json({ message: "Token ok" }))
    .catch(next);
}

function forgotPasswordUpdate(req, res, next) {
  userService
    .forgotPasswordUpdate(req.body)
    .then(() => res.json({ message: "La contraseña fue actualizada" }))
    .catch(next);
}

//CHANGE PW

function changePassword(req, res, next) {
  userService
    .changePassword(req.headers.authorization.split(" ")[1], req.body)
    .then(() => res.json({ message: "La contraseña fue actualizada" }))
    .catch(next);
}

function toggleOverlappingApps(req, res, next) {
  userService
    .toggleOverlappingApps(req.user.sub)
    .then((user) =>
      user
        ? res.status(200).json(user)
        : res.status(400).json({ message: "Invalid user ID." })
    )
    .catch((err) => next(err));
}

function toggleDoNotDisturb(req, res, next) {
  userService
    .toggleDoNotDisturb(req.user.sub)
    .then((user) =>
      user
        ? res.status(200).json(user)
        : res.status(400).json({ message: "Invalid user ID." })
    )
    .catch((err) => next(err));
}

function userMetrics(req, res, next) {
  userService
    .userMetrics(req.user.sub)
    .then((report) =>
      report
        ? res.status(200).json(report)
        : res
            .status(400)
            .json({ message: "The report could not be generated." })
    )
    .catch((err) => next(err));
}

function getDND(req, res, next) {
  userService
    .getDND(req.user.sub)
    .then((user) =>
      user
        ? res.status(200).json(user)
        : res.status(400).json({ message: "DND users could not be retrieved." })
    )
    .catch((err) => next(err));
}

function deleteUser(req, res, next) {
  userService
    .deleteUser(req.user.sub, req.params.id)
    .then((user) =>
      user
        ? res.status(200).json(user)
        : res.status(400).json({ message: "Usuario eliminado" })
    )
    .catch((err) => next(err));
}

function getAll(req, res, next) {
  userService
    .getAll()
    .then((users) => res.json(users))
    .catch((err) => next(err));
}

function getById(req, res, next) {
  userService
    .getById(req.params.id)
    .then((user) => (user ? res.json(user) : res.sendStatus(404)))
    .catch((err) => next(err));
}
