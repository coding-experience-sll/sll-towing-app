const assert = require("assert");
const { connection } = require("../../_helpers/db");
const faqService = require("../../collections/faqs/faq.service");
const { ADMIN_ID } = require("../../config");

describe("faqs test suite", function () {
  let faq;
  after(function () {
    connection.dropDatabase();
  });
  it("# should create a new faq", async function () {
    const faqPayload = {
      question: "testQuestion",
      answer: "testAnswer",
    };
    const result = await faqService.create(ADMIN_ID, faqPayload);
    faq = result;
    assert.equal(result.question, "testQuestion", "Unable to create faq");
  });
  it("# should retrieve all faqs", async function () {
    const result = await faqService.getAll(1, 10);
    assert.equal(
      result[0]._id.toString(),
      faq._id.toString(),
      "Unable to retrieve faqs"
    );
  });
  it("# should edit the faq", async function () {
    const editPayload = {
      id: faq._id,
      question: "modifiedQuestion",
      answer: "modifiedAnswer",
    };
    const result = await faqService.edit(ADMIN_ID, editPayload);
    assert.equal(result.question, "modifiedQuestion", "Unable to edit faq");
  });
  it("# should delete the faq", async function () {
    const result = await faqService.deleteFaq(ADMIN_ID, faq._id);
    assert.equal(
      result._id.toString(),
      faq._id.toString(),
      "Unable to delete faq"
    );
  });
});
