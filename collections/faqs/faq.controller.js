const express = require("express");
const router = express.Router();
const faqService = require("./faq.service");

//routes
router.post("/create", create);
router.put("/edit", edit);
router.delete("/deleteFaq/:id", deleteFaq);
router.get("/", getAll);

module.exports = router;

function create(req, res, next) {
  faqService
    .create(req.user.sub, req.body)
    .then((faq) =>
      faq
        ? res.status(200).json(faq)
        : res.status(400).json({ message: "Could not create the FAQ." })
    )
    .catch((err) => next(err));
}

function edit(req, res, next) {
  faqService
    .edit(req.user.sub, req.body)
    .then((faq) =>
      faq
        ? res.status(200).json(faq)
        : res.status(400).json({ message: "Could not edit the FAQ." })
    )
    .catch((err) => next(err));
}

function deleteFaq(req, res, next) {
  faqService
    .deleteFaq(req.user.sub, req.params.id)
    .then((faq) =>
      faq
        ? res.status(200).json(faq)
        : res.status(400).json({ message: "Could not delete the FAQ." })
    )
    .catch((err) => next(err));
}

function getAll(req, res, next) {
  faqService
    .getAll(req.query.page, req.query.limit)
    .then((faqs) => res.json(faqs))
    .catch((err) => next(err));
}
