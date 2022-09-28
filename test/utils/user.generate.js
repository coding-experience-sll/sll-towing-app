const userService = require("../../collections/users/user.service");

module.exports = { create, createTwo };

async function create() {
  let user;

  const userPayload = {
    email: "mocktest@gruout.com",
    username: "mocktestGruout",
    password: "111111",
    name: "mocktest",
    lastName: "gruout",
    phone: 1234567890,
    nationality: "Argentina",
    language: "Español",
    currency: "USDT",
    currencyAmount: 5,
  };

  const registered = await userService.create(userPayload);
  user = { ...registered, password: userPayload.password };

  const verified = await userService.verifyEmail({
    token: user.verificationToken,
  });

  const authenticated = await userService.authenticate({
    email: user.email,
    password: user.password,
  });

  if (authenticated.email) user.token = authenticated.token;

  return user;
}

async function createTwo() {
  let user1, user2;

  const userPayload1 = {
    email: "mocktest@gruout.com",
    username: "mocktestGruout",
    password: "111111",
    name: "mocktest",
    lastName: "gruout",
    phone: 1234567890,
    nationality: "Argentina",
    language: "Español",
    currency: "USDT",
    currencyAmount: 5,
  };

  const userPayload2 = {
    email: "mocktest2@gruout.com",
    username: "mocktestGruout2",
    password: "111111",
    name: "mocktest2",
    lastName: "gruout2",
    phone: 1234567892,
    nationality: "Argentina",
    language: "Español",
    currency: "ARS",
    currencyAmount: 1000,
  };

  const registered1 = await userService.create(userPayload1);
  user1 = { ...registered1, password: userPayload1.password };

  const registered2 = await userService.create(userPayload2);
  user2 = { ...registered2, password: userPayload2.password };

  const verified1 = await userService.verifyEmail({
    token: user1.verificationToken,
  });

  const verified2 = await userService.verifyEmail({
    token: user2.verificationToken,
  });

  const authenticated1 = await userService.authenticate({
    email: user1.email,
    password: user1.password,
  });

  const authenticated2 = await userService.authenticate({
    email: user2.email,
    password: user2.password,
  });

  if (authenticated1.email) user1.token = authenticated1.token;

  if (authenticated2.email) user2.token = authenticated2.token;

  const users = [user1, user2];

  return users;
}
