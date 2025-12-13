const { Router } = require("express");
const router = Router();

const scoreController = require("../controller/scoreController");

router.get("/gameboards/:boardId/score", scoreController.getScore);
router.post("/gameboards/:boardId/score", scoreController.saveScore);

module.exports = router;
