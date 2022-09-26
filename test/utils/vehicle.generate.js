const vehicleService = require("../../collections/vehicles/vehicle.service");

module.exports = { create };

async function create(user) {
  let vehicle;

  const vehiclePayload = {
    type: "Auto",
    model: "ford fiesta",
    plateNumber: "ABC 124",
    year: 2017,
    color: "Blanco",
    vehiclePicture: "ford",
  };

  const result = await vehicleService.createTest(vehiclePayload, user.token);

  vehicle = result;

  return vehicle;
}
