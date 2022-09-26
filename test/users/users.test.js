const assert = require("assert");
const { connection } = require("../../_helpers/db");
const userService = require("../../collections/users/user.service");
const playeridService = require("../../collections/playerids/playerid.service");
const { ADMIN_ID } = require("../../config");

describe("User test suite", function () {
  let user;
  before(function () {
    connection.dropDatabase();
  });
  after(function () {
    connection.dropDatabase();
  });

  it("# should register a user", async function () {
    const userPayload = {
      email: "mocktest@gruout.com",
      username: "mocktestGruout",
      password: "111111",
      name: "mocktest",
      lastName: "gruout",
      phone: 1234567890,
      nationality: "Argentina",
      language: "Español",
      dni: 12345678,
      currency: "USDT",
      currencyAmount: 5,
      doNotDisturb: false,
      overlappingApps: false,
    };
    const result = await userService.create(userPayload);
    user = { ...result, password: userPayload.password };
    assert.notEqual(result.id, undefined, "unable to create this user");
  });
  it("# should resend the verify code", async function () {
    const result = await userService.resendVerify({ emailParam: user.email });
    const newToken = await userService.getById(user.id);
    user.verificationToken = newToken.verificationToken;
    assert.equal(result, undefined, "Unable to resend verify code");
  });
  it("# should verify an existing user", async function () {
    const result = await userService.verifyEmail({
      token: user.verificationToken,
    });
    assert.equal(
      result.verified,
      true,
      `unable to verify ${user.username} with token ${user.verificationToken}`
    );
  });
  it("# should authenticate new user", async function () {
    try {
      const wrongResult = await userService.authenticate({
        email: user.email,
        password: "111112",
      });
      assert.notEqual(
        wrongResult?.email,
        user.email,
        `shouldn't be able to login!`
      );
    } catch (error) {
      console.error(`exception: ${error}`);
    }
    const result = await userService.authenticate({
      email: user.email,
      password: user.password,
    });
    if (result.email) user.token = result.token;
    assert.equal(
      result.id,
      user.id,
      `unable to authenticate ${user.email} with password ${user.password}`
    );
  });
  it("# should retrieve user id", async function () {
    const result = await userService.getUserId(user.token);
    assert.equal(
      result,
      user.id,
      `unable to retrieve token for user ${user.email}`
    );
  });
  it("# should retrieve user using token", async function () {
    const result = await userService.retrieveUser(user.token);
    assert.equal(result.id, user.id, `unable to retrieve user ${user.email}`);
  });
  it("# should retrieve all users", async function () {
    const result = await userService.getAll();
    assert.equal(
      result[0]._id,
      user.id, //si esta vacia devuelve unable to retrieve users. que deberia volver?
      `unable to retrieve users`
    );
  });
  it("# should retrieve user by id (not token)", async function () {
    const result = await userService.getById(user.id);
    assert.equal(result._id, user.id, `unable to retrieve user ${user.email}`);
  });
  it("# should retrieve the decoded token", async function () {
    const result = await userService.getTokenDecoded(user.token);
    assert.equal(result.userId, user.id, "Unable to decode token");
  });
  it("# should edit the user info", async function () {
    const editPayload = {
      name: "testChange",
      lastName: "testChangez",
      phone: 123455642,
      nationality: "Brasilero",
      language: "Portugues",
      currency: "BTC",
      currencyAmount: 0.0005,
    };
    const result = await userService.editInfo(user.id, editPayload);
    assert.equal(result.name, "testChange", "Unable to edit user");
  });
  it("# should retrieve the user devices", async function () {
    const create = await playeridService.addPlayerId(user.token, "12345");
    const result = await userService.getUserDevices(user.id);
    assert.equal(result[0], create.playerId, "Unable to retrieve user devices");
  });
  it("# should change the user password", async function () {
    const passwordPayload = {
      currentPw: "111111",
      pw: "222222",
      confirmPw: "222222",
    };
    const pwChange = await userService.changePassword(
      user.token,
      passwordPayload
    );
    const result = await userService.authenticate({
      email: user.email,
      password: "222222",
    });
    assert.equal(
      result.id,
      user.id,
      `unable to authenticate ${user.email} with password 222222`
    );
  });
  it("# should request a forgot password", async function () {
    const result = await userService.forgotPasswordRequest({
      email: user.email,
    });
    const foundUser = await userService.getById(user.id);
    user = foundUser;
    assert.equal(
      typeof foundUser.forgotPwToken,
      "string",
      "Unable to request forgot pw token"
    );
  });
  it("# should verify forgot pw token ok", async function () {
    const result = await userService.forgotPasswordTokenOnly({
      token: user.forgotPwToken,
    });
    assert.equal(result, undefined, "Unable to verify forgot pw token");
  });
  it("# should change the password after forgot pw", async function () {
    const passwordPayload = {
      token: user.forgotPwToken,
      pw: "333333",
      confirmPw: "333333",
    };
    const result = await userService.forgotPasswordUpdate(passwordPayload);
    assert.equal(
      result,
      undefined,
      "Unable to change password after forgot pw"
    );
  });
  it("# should toggle overlapping apps on and then off", async function () {
    const on = await userService.toggleOverlappingApps(user.id);
    assert.equal(
      on.overlappingApps,
      true,
      "Unable to toggle overlapping apps on"
    );
    const off = await userService.toggleOverlappingApps(user.id);
    assert.equal(
      off.overlappingApps,
      false,
      "Unable to toggle overlapping apps off"
    );
  });
  it("# should toggle DND on and then off", async function () {
    const on = await userService.toggleDoNotDisturb(user.id);
    assert.equal(
      on.doNotDisturb,
      true,
      "Unable to toggle overlapping apps on."
    );
    const off = await userService.toggleDoNotDisturb(user.id);
    assert.equal(
      off.doNotDisturb,
      false,
      "Unable to toggle overlapping apps off"
    );
  });
  it("# should generate user metrics", async function () {
    const result = await userService.userMetrics(ADMIN_ID);
    assert.equal(result.newUsers, 1, "Unable to generate user metrics");
  });
  it("# should get DND list", async function () {
    await userService.toggleDoNotDisturb(user.id);
    const result = await userService.getDND(ADMIN_ID);
    assert.equal(
      result[0]._id.toString(),
      user.id.toString(),
      "Unable to retrieve DND list"
    );
  });
  it("# should retrieve all users", async function () {
    const result = await userService.getAll();
    assert.equal(
      result[0]._id.toString(),
      user.id.toString(),
      "Unable to retreive all users"
    );
  });
  it("# should retrieve a specific user", async function () {
    const result = await userService.getById(user.id);
    assert.equal(
      result._id.toString(),
      user.id.toString(),
      "Unable to retreive the specified user"
    );
  });
  it("# should delete the user", async function () {
    const result = await userService.deleteUser(ADMIN_ID, user.id);
    assert.equal(result.deletedCount, 1, "Unable to delete user");
  });
});
