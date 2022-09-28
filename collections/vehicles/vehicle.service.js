const db = require("../../_helpers/db");
const Vehicle = db.Vehicle;
const User = db.User;
const userService = require("../users/user.service");
const { uploadFile } = require("../../_helpers/s3");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const path = require("path");

module.exports = {
  create,
  getUserVehicles,
  editVehicle,
  editVehiclePicture,
  deleteVehicle,
  verifyPayment,
  togglePayments,
  getAll,
  getById,
  createTest,
};

//Create vehicle

async function create(userParam, token, file) {
  const existing = await Vehicle.findOne({
    plateNumber: userParam.plateNumber,
  });

  if (existing)
    return (error = {
      message: `The license number ${userParam.plateNumber} is already registered.`,
      errorCode: "R002",
    });

  const userId = await userService.getUserId(token);

  const ext = path.parse(file.originalname).ext;

  const uploadedPicture = await uploadFile(
    file,
    `vehicles/${file.filename}${ext}`
  );
  await unlinkFile(file.path);

  const vhpKey = uploadedPicture.Key.slice(9); //stores the vehicle id without the vehicles/ path
  userParam.vehiclePicture = vhpKey;

  const vehicle = new Vehicle({
    ...userParam,
    createdAt: Date.now(),
    user: userId,
  });

  await vehicle.save();

  //adds the vehicle ID to the user's vehicle list.
  const user = await User.findOne({ _id: userId });

  user.vehicleList.push(vehicle._id);

  await user.save();

  return vehicle;
}

//retrieve user vehicles

async function getUserVehicles(token) {
  const userId = await userService.getUserId(token);

  const vehicles = await Vehicle.find({ user: userId }).populate({
    path: "user",
    model: User,
    select: "name lastName currency currencyAmount",
  });

  if (!vehicles) return;

  return vehicles;
}

//edit vehicle info

async function editVehicle(token, id, changes) {
  const userId = await userService.getUserId(token);

  //only the vehicle owner will be capable of editing
  const vehicle = await Vehicle.findOneAndUpdate(
    { $and: [{ _id: id }, { user: userId }] },
    { $set: changes },
    { new: true },
    (err, vehicle) => {
      if (err) {
        console.error(err);
        return err;
      }
      return vehicle;
    }
  );
  return vehicle;
}

//edit vehicle, only picture

async function editVehiclePicture(userId, vehicleId, file) {
  //only the vehicle owner will be capable of editing
  const vehicle = await Vehicle.findOne({
    $and: [{ _id: vehicleId }, { user: userId }],
  }).populate({
    path: "user",
    model: User,
    select: "name lastName currency currencyAmount",
  });

  if (!vehicle) throw "invalid vehicle ID or the vehicle is not yours";

  const ext = path.parse(file.originalname).ext;

  //if there was a previous picture, it's replaced
  let updatedPath = `vehicles/${file.filename}${ext}`;

  //creates a new path using the previous file's name and the new file's extension
  if (vehicle.vehiclePicture) {
    const noExt = path.parse(vehicle.vehiclePicture).name;
    updatedPath = `vehicles/${noExt}${ext}`;
  }

  //uploads the new picture then deletes the local file
  const uploadedPicture = await uploadFile(file, updatedPath);

  await unlinkFile(file.path);

  const vhpKey = uploadedPicture.Key.slice(9);

  vehicle.vehiclePicture = vhpKey;

  await vehicle.save();
  return vehicle;
}

//delete vehicle

async function deleteVehicle(token, id) {
  const userId = await userService.getUserId(token);

  const user = await User.findOne({ _id: userId });

  //looks for the vehicle ID in the user's vehicle list in order to remove it.
  const vehicleIndex = user.vehicleList.indexOf(id);

  //if the index turns out to be 0, either the vehicle ID is invalid or the vehicle is not the users'.
  if (vehicleIndex < 0) return;

  user.vehicleList.splice(vehicleIndex, 1);

  await user.save();

  const vehicle = await Vehicle.deleteOne({ _id: id });

  //returns mongo's object response.
  return vehicle;
}

//check wether the payments for a vehicle are on or off

async function verifyPayment(id) {
  const vehicle = await Vehicle.findById(id);

  if (!vehicle) return;

  let message;

  vehicle.payments
    ? (message = "Payments for this vehicle are on.")
    : (message = "Payments for this vehicle are off.");

  return message;
}

//turn payments on or off

async function togglePayments(token, id) {
  const userId = await userService.getUserId(token);

  const vehicle = await Vehicle.findOne({
    $and: [{ _id: id }, { user: userId }],
  }).populate({
    path: "user",
    model: User,
    select: "name lastName currency currencyAmount",
  });
  //if the result is empty, either the vehicle ID is invalid or the vehicle is not the users'.
  if (!vehicle) return;

  //changes payments to true or false according to its previous value
  vehicle.payments ? (vehicle.payments = false) : (vehicle.payments = true);

  await vehicle.save();

  return vehicle;
}

//get functions

async function getAll() {
  return await Vehicle.find().populate({
    path: "user",
    model: User,
    select: "name lastName currency currencyAmount",
  });
}

//needs vehicle id via params
async function getById(id) {
  const vehicle = await Vehicle.findById(id).populate({
    path: "user",
    model: User,
    select: "name lastName currency currencyAmount vehiclePicture",
  });

  if (!vehicle) throw "invalid vehicle ID.";

  const user = await User.findById(vehicle.user);

  return {
    _id: vehicle._id,
    type: vehicle.type,
    model: vehicle.model,
    vehiclePicture: vehicle.vehiclePicture,
    plateNumber: vehicle.plateNumber,
    year: vehicle.year,
    color: vehicle.color,
    image: vehicle.image,
    user: vehicle.user,
    payments: vehicle.payments,
    currency: user.currency,
    currencyAmount: user.currencyAmount,
  };
}

async function createTest(userParam, token) {
  //for testing purposes only

  const userId = await userService.getUserId(token);

  const vehicle = new Vehicle({
    ...userParam,
    createdAt: Date.now(),
    user: userId,
  });

  await vehicle.save();

  //adds the vehicle ID to the user's vehicle list.
  const user = await User.findOne({ _id: userId });

  user.vehicleList.push(vehicle._id);

  await user.save();

  return vehicle;
}
