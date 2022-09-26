const express = require("express");
const router = express.Router();
const vehicleService = require("./vehicle.service");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { validateCreation } = require("./misc/vehicle.validation");

//routes
router.post("/create", upload.single("vehiclePicture"), create);
router.get("/getUserVehicles", getUserVehicles);
router.put("/editVehicle/:id", editVehicle);
router.put(
  "/editVehiclePicture/:id",
  upload.single("vehiclePicture"),
  editVehiclePicture
);
router.delete("/deleteVehicle/:id", deleteVehicle);
router.get("/verifyPayment/:id", verifyPayment);
router.put("/togglePayments/:id", togglePayments);

//get APIs
router.get("/", getAll);
router.get("/:id", getById);

module.exports = router;

//create vehicle

function create(req, res, next) {
  try {
    const validBody = validateCreation(req.body);
    if (validBody.errorCode) {
      res.status(400).json(validBody);
      return;
    }
    const file = req.file;
    vehicleService
      .create(req.body, req.headers.authorization.split(" ")[1], file)
      .then((vehicle) =>
        vehicle
          ? res.status(200).json(vehicle)
          : res.status(400).json({ message: "Missing required fields." })
      )
      .catch((err) => next(err));
  } catch (err) {
    next(err);
  }
}

//retrieve user vehicles

function getUserVehicles(req, res, next) {
  vehicleService
    .getUserVehicles(req.headers.authorization.split(" ")[1])
    .then((vehicles) =>
      vehicles
        ? res.status(200).json(vehicles)
        : res.status(400).json({ message: "The user has no registered cars." })
    )
    .catch((err) => next(err));
}

//edit vehicle

function editVehicle(req, res, next) {
  vehicleService
    .editVehicle(
      req.headers.authorization.split(" ")[1],
      req.params.id,
      req.body
    )
    .then((vehicle) =>
      vehicle
        ? res.status(200).json(vehicle)
        : res.status(400).json({
            message: "Invalid vehicle ID, or the vehicle is not yours.",
          })
    )
    .catch((err) => next(err));
}

function editVehiclePicture(req, res, next) {
  const file = req.file;
  vehicleService
    .editVehiclePicture(req.user.sub, req.params.id, file)
    .then((vehicle) =>
      vehicle
        ? res.status(200).json(vehicle)
        : res.status(400).json({
            message: "Invalid vehicle ID, or the vehicle is not yours.",
          })
    )
    .catch((err) => next(err));
}

//delete vehicle

function deleteVehicle(req, res, next) {
  vehicleService
    .deleteVehicle(req.headers.authorization.split(" ")[1], req.params.id)
    .then((vehicle) =>
      vehicle.ok == 1 && vehicle.deletedCount == 1
        ? res.status(200).json({ message: "Vehicle deleted succesfully!" })
        : res.status(400).json({
            message: "Invalid vehicle ID, or the vehicle is not yours.",
          })
    )
    .catch((err) => next(err));
}

//check wether the payments for a vehicle are on or off

function verifyPayment(req, res, next) {
  vehicleService
    .verifyPayment(req.params.id)
    .then((message) =>
      message
        ? res.status(200).json({ message: message })
        : res.status(400).json({ message: "Invalid vehicle ID." })
    )
    .catch((err) => next(err));
}

//turn payments on or off

function togglePayments(req, res, next) {
  vehicleService
    .togglePayments(req.headers.authorization.split(" ")[1], req.params.id)
    .then((vehicle) =>
      vehicle
        ? res.status(200).json(vehicle)
        : res.status(400).json({
            message: "Invalid vehicle ID, or the vehicle is not yours.",
          })
    )
    .catch((err) => next(err));
}

function getAll(req, res, next) {
  vehicleService
    .getAll()
    .then((vehicles) => res.status(200).json(vehicles))
    .catch((err) => next(err));
}

function getById(req, res, next) {
  vehicleService
    .getById(req.params.id)
    .then((vehicle) =>
      vehicle
        ? res.status(200).json(vehicle)
        : res.status(404).json({ message: "Invalid ID." })
    )
    .catch((err) => next(err));
}
