const { Router } = require("express");
const router = Router();

const gameboardController = require("../controller/gameboardController");

router.get("/gameboards", gameboardController.getGameBoards);

module.exports = router;
