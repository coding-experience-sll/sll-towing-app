const db = require("../../_helpers/db");
const BusinessConstants = db.BusinessConstants;
const { ADMIN_ID } = require("../../config");

module.exports = {
  edit,
  getConstant,
  getConstants,
  create,
};

/* business constants stores values that
the admins may want to modify, like report/session expiration time. */

async function edit(constantId, value, userId) {
  if (userId != ADMIN_ID) throw "You do not have admin privileges.";

  const constant = await BusinessConstants.findById(constantId);

  if (!constant) throw "There is no constant with that ID.";

  constant.value = Number(value);

  await constant.save();

  return constant;
}

async function getConstant(id, userId) {
  if (userId != ADMIN_ID) throw "You do not have admin privileges.";

  return await BusinessConstants.findById(id);
}

async function getConstants(userId) {
  if (userId != ADMIN_ID) throw "You do not have admin privileges.";

  return await BusinessConstants.find();
}

async function create(userParam) {
  //for testing purposes only
  const constant = new BusinessConstants(userParam);

  await constant.save();

  return constant;
}
