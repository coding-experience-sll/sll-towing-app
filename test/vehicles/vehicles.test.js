const assert = require("assert");
const { connection } = require("../../_helpers/db");
const vehicleService = require("../../collections/vehicles/vehicle.service");
const userGenerator = require("../utils/user.generate");

describe("Vehicles test suite", function () {
  let user, vehicle;
  after(function () {
    connection.dropDatabase();
  });
  before(async function () {
    user = await userGenerator.create();
    return user;
  });

  it("# should create a new vehicle", async function () {
    const vehiclePayload = {
      type: "Auto",
      model: "Ford Fiesta",
      plateNumber: "ABC 124",
      year: 2017,
      color: "White",
      vehiclePicture: "ford.jpg",
    };

    const result = await vehicleService.createTest(vehiclePayload, user.token);

    vehicle = result;

    assert.notEqual(result.id, undefined, "Unable to create the vehicle");
  });
  it("# should retrieve the new vehicle", async function () {
    const result = await vehicleService.getById(vehicle.id);
    assert.equal(
      result._id,
      vehicle.id,
      `unable to retrieve vehicle with id ${vehicle.id}`
    );
  });
  it("# should retrieve all of the users vehicles", async function () {
    const result = await vehicleService.getUserVehicles(user.token);
    assert.equal(
      result[0].id,
      vehicle.id,
      `unable to retrieve all user vehicles with token ${user.token}`
    );
  });
  it("# should toggle payments on", async function () {
    const result = await vehicleService.togglePayments(user.token, vehicle.id);
    assert.equal(
      result.payments,
      true,
      `unable to toggle payments with id ${vehicle.id}`
    );
  });
  it("# payments should be on", async function () {
    const result = await vehicleService.verifyPayment(vehicle.id);
    assert.equal(
      result,
      "Payments for this vehicle are on.",
      `unable to verify payment with ${vehicle.id}`
    );
  });
  it("# should toggle payments off", async function () {
    const result = await vehicleService.togglePayments(user.token, vehicle.id);
    assert.equal(
      result.payments,
      false,
      `unable to toggle payments with id ${vehicle.id}`
    );
  });
  it("# payments should be off", async function () {
    const result = await vehicleService.verifyPayment(vehicle.id);
    assert.equal(
      result,
      "Payments for this vehicle are off.",
      `unable to verify payment with ${vehicle.id}`
    );
  });
  it("# should edit model and color", async function () {
    const editedFields = {
      model: "Ford Focus",
      color: "Black",
    };
    const result = await vehicleService.editVehicle(
      user.token,
      vehicle.id,
      editedFields
    );
    assert.equal(
      result.color,
      editedFields.color,
      `unable to edit model (${editedFields.model}) and color (${editedFields.color})`
    );
  });
  it("# should retrieve all vehicles", async function () {
    const result = await vehicleService.getAll();
    assert.equal(
      result[0]._id.toString(),
      vehicle.id.toString(),
      "Unable to retrieve all vehicles"
    );
  });
  it("# should delete the vehicle", async function () {
    const result = await vehicleService.deleteVehicle(user.token, vehicle.id);
    assert.equal(
      result.deletedCount,
      1,
      `unable to delete vehicle with id ${vehicle.id}`
    );
  });
});
