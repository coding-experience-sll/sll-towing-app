const db = require("../../_helpers/db");
const Faq = db.Faq;
const { ADMIN_ID } = require("../../config");

module.exports = {
  create,
  edit,
  deleteFaq,
  getAll,
};

//frequently asked questions. has only two fields: question and answer

async function create(userId, userParam) {
  if (userId != ADMIN_ID) throw "You do not have admin privileges.";

  const faq = new Faq(userParam);

  await faq.save();

  return faq;
}

async function edit(userId, userParam) {
  if (userId != ADMIN_ID) throw "You do not have admin privileges.";

  const faq = await Faq.findById(userParam.id);

  if (!faq) throw "Invalid faq ID.";

  if (userParam.question) faq.question = userParam.question;

  if (userParam.answer) faq.answer = userParam.answer;

  await faq.save();

  return faq;
}

async function deleteFaq(userId, id) {
  if (userId != ADMIN_ID) throw "You do not have admin privileges.";

  const faq = await Faq.findByIdAndDelete(id);

  if (faq.deletedCount < 1) throw "Invalid faq ID.";

  return faq;
}

async function getAll(page, limit) {
  //defaults/formats the page and limit parameters
  !page || page <= 1 || isNaN(page)
    ? (page = 0)
    : (page = (Number(page) - 1) * limit);

  !limit || isNaN(limit) ? (limit = 10) : (limit = Number(limit));

  return await Faq.find().skip(page).limit(limit);
}
