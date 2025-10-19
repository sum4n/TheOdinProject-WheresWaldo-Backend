const { Router } = require("express");
const router = Router();

const assetController = require("../controller/assetController");

router.get("/assets", assetController.getGameAssets);

module.exports = router;
