const vehicleService = require("../../collections/vehicles/vehicle.service");

module.exports = { create };

async function create(user) {
  let vehicle;

  const vehiclePayload = {
    type: "Auto",
    model: "Ford Fiesta",
    plateNumber: "ABC 124",
    year: 2017,
    color: "White",
    vehiclePicture: "ford",
  };

  const result = await vehicleService.createTest(vehiclePayload, user.token);

  vehicle = result;

  return vehicle;
}
