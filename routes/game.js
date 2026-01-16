const { Router } = require("express");
const router = Router();

const gameController = require("../controller/gameController");

router.get("/game/:boardId", gameController.startGame);

router.get("/game/:boardId/characters/:characterId", gameController.gamePlay);

module.exports = router;
