const express = require("express");
const router = express.Router();
const playerIdService = require("./playerid.service");

//routes
router.post("/create", create);

module.exports = router;

//ADD PLAYER ID

function create(req, res, next) {
  playerIdService
    .addPlayerId(req.headers.authorization.split(" ")[1], req.body.playerId)
    .then((playerId) =>
      playerId
        ? res.status(200).json(playerId)
        : res.status(400).json({ message: "Could not add the player ID." })
    )
    .catch((err) => next(err));
}
