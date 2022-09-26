const assert = require("assert");
const { connection } = require("../../_helpers/db");
const playeridService = require("../../collections/playerids/playerid.service");
const userGenerator = require("../utils/user.generate");

describe("player id test suite", function () {
  let user, playerId;
  after(function () {
    connection.dropDatabase();
  });
  before(async function () {
    connection.dropDatabase();
    user = await userGenerator.create();
    return user;
  });

  it("# should add a player id", async function () {
    const result = await playeridService.addPlayerId(user.token, "12345");
    playerId = result;
    assert.equal(result.playerId, "12345", "Unable to add player id");
  });
  it("# should retrieve all player ids", async function () {
    const result = await playeridService.getAll();
    assert.equal(
      result[0]._id.toString(),
      playerId._id.toString(),
      "Unable to retreive all player ids"
    );
  });
  it("# should retrieve a specific user", async function () {
    const result = await playeridService.getById(playerId._id);
    assert.equal(
      result._id.toString(),
      playerId._id.toString(),
      "Unable to retreive the specified user"
    );
  });
});
