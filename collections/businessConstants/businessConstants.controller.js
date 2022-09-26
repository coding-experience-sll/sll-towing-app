const express = require("express");
const router = express.Router();
const businessConstantsService = require("./businessConstants.service");

//routes
router.put("/edit", edit);
router.get("/getConstant/:id", getConstant);
router.get("/getConstants", getConstants);

module.exports = router;

//EDIT CONSTANTS

function edit(req, res, next) {
  businessConstantsService
    .edit(req.body.constantId, req.body.value, req.user.sub)
    .then((constant) =>
      constant
        ? res.status(200).json(constant)
        : res.status(400).json({ message: "Unable to edit the constant." })
    )
    .catch((err) => next(err));
}

//GET CONSTANTS

function getConstant(req, res, next) {
  businessConstantsService
    .getConstant(req.params.id, req.user.sub)
    .then((constant) =>
      constant
        ? res.status(200).json(constant)
        : res.status(404).json({ message: "Invalid ID." })
    )
    .catch((err) => next(err));
}

function getConstants(req, res, next) {
  businessConstantsService
    .getConstants(req.user.sub)
    .then((constants) => res.status(200).json(constants))
    .catch((err) => next(err));
}
