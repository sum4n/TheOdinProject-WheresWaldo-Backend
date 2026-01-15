const { Router } = require("express");
const router = Router();

const gameController = require("../controller/gameController");

router.get("/game/:boardId", gameController.startGame);

module.exports = router;
