const assert = require("assert");
const { connection } = require("../../_helpers/db");
const reportService = require("../../collections/reports/report.service");
const userGenerator = require("../utils/user.generate");
const vehicleGenerator = require("../utils/vehicle.generate");
const { ADMIN_ID } = require("../../config");

describe("Reports test suite", function () {
  let users, vehicle, report;
  after(function () {
    connection.dropDatabase();
  });
  before(async function () {
    users = await userGenerator.createTwo();
    vehicle = await vehicleGenerator.create(users[0]);
    return users, vehicle;
  });
  it("# should create a new report", async function () {
    const reportPayload = {
      vehicleId: vehicle._id,
      type: "Robo",
      longitude: 1,
      latitude: 1,
    };

    const result = await reportService.create(reportPayload, users[1].token);
    report = result;
    assert.equal(
      result.vehicle._id.toString(),
      vehicle._id.toString(),
      "Unable to create report"
    );
  });
  it("# should retrieve the vehicle reports", async function () {
    const result = await reportService.getByVehicle(1, 10, report.vehicle._id);
    assert.equal(
      result[0].vehicle._id.toString(),
      vehicle._id.toString(),
      "Unable to retrieve the vehicles reports"
    );
  });
  it("# should retrieve the users reports", async function () {
    const result = await reportService.getByUser(users[0].token, 1, 10);
    assert.equal(
      result[0].userId,
      users[0]._id,
      "Unable to retrieve the users reports"
    );
  });
  it("# should retrieve the reports the user emitted", async function () {
    const result = await reportService.getMyReports(users[1].token, 1, 10);
    assert.equal(
      result[0].userId,
      users[1]._id,
      "Unable to retrieve the users reports"
    );
  });
  it("# should change the report status", async function () {
    const result = await reportService.changeStatus(report._id, 0);
    assert.equal(
      result.reportStatus.code,
      0,
      "Unable to change the report status"
    );
  });
  it("# should approve a report payment for both users", async function () {
    const result = await reportService.approvePayment(users[0].id, report._id);

    assert.equal(result.reportStatus.code, 1, "Unable to approve payment");

    const result2 = await reportService.approvePayment(users[1].id, report._id);

    assert.equal(result2.reportStatus.code, 3, "Unable to approve payment");
  });
  it("# should generate report metrics", async function () {
    const result = await reportService.reportMetrics(ADMIN_ID);
    assert.equal(
      result.weeklyGenerated,
      1,
      "Unable to generate report metrics"
    );
  });
  it("# should retrieve all reports", async function () {
    const result = await reportService.getAll();
    assert.equal(
      result[0]._id.toString(),
      report._id.toString(),
      "Unable to retreive all reports"
    );
  });
  it("# should retrieve a specific report", async function () {
    const result = await reportService.getById(report._id);
    assert.equal(
      result._id.toString(),
      report._id.toString(),
      "Unable to retreive the specified report"
    );
  });
});
