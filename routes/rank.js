const { Router } = require("express");
const router = Router();

const rankController = require("../controller/rankController");

router.get("/gameboards/:boardId/rank", rankController.getRank);

module.exports = router;
