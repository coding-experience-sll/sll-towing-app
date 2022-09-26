const db = require("../../_helpers/db");
const PlayerId = db.PlayerId;
const userService = require("../users/user.service");
const { fromUnixTime, differenceInMilliseconds } = require("date-fns");

module.exports = {
  addPlayerId,
  getAll,
  getById,
};
/* player IDs are device IDs for push notifications.
Handled by front-end, we just provide endpoints to link them
to the user and to list them. */

//ADD PLAYER ID

async function addPlayerId(token, playerId) {
  //decodes user id and token expiration
  const tokenDecoded = await userService.getTokenDecoded(token);

  const existingId = await PlayerId.findOne({ playerId: playerId });
  //checks wether the existing id was linked to your account. If not, it relinks it to you.
  if (existingId && existingId.user == tokenDecoded.userId)
    throw "This device is already linked to your user";
  else if (existingId) {
    existingId.user = tokenDecoded.userId;
    existingId.expirationDate = fromUnixTime(tokenDecoded.exp);

    await existingId.save();
    return existingId;
  }

  const newPlayerId = new PlayerId({
    user: tokenDecoded.userId,
    playerId: playerId,
    expirationDate: fromUnixTime(tokenDecoded.exp),
  });

  await newPlayerId.save();

  return newPlayerId;
}

//get functions
async function getAll() {
  return await PlayerId.find();
}

async function getById(id) {
  //add exception for invalid id
  return await PlayerId.findById(id);
}
