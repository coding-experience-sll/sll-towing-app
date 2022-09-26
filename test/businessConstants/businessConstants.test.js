const assert = require("assert");
const { connection } = require("../../_helpers/db");
const businessConstantsService = require("../../collections/businessConstants/businessConstants.service");
const userGenerator = require("../utils/user.generate");
const { ADMIN_ID } = require("../../config");

describe("business constants test suite", function () {
  let user, businessConstant;
  after(function () {
    connection.dropDatabase();
  });
  before(async function () {
    connection.dropDatabase();
    user = await userGenerator.create();
    constantPayload = {
      name: "testConstant",
      value: 10,
    };
    businessConstant = await businessConstantsService.create(constantPayload);
    return user;
  });

  it("# should retrieve all constants", async function () {
    const result = await businessConstantsService.getConstants(ADMIN_ID);
    assert.equal(
      result[0]._id.toString(),
      businessConstant._id.toString(),
      "Unable to retrieve business constants"
    );
  });
  it("# should retrieve a specific constant", async function () {
    const result = await businessConstantsService.getConstant(
      businessConstant._id,
      ADMIN_ID
    );
    assert.equal(
      result._id.toString(),
      businessConstant._id.toString(),
      "Unable to retrieve the business constant"
    );
  });
  it("# should edit the constant", async function () {
    const result = await businessConstantsService.edit(
      businessConstant._id,
      20,
      ADMIN_ID
    );
    assert.equal(result.value, 20, "Unable to edit the constant");
  });
});
