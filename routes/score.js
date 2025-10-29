const { Router } = require("express");
const router = Router();

const scoreController = require("../controller/scoreController");

router.get("/score", scoreController.getScore);
router.post("/score", scoreController.saveScore);

module.exports = router;
