const { Router } = require("express");
const router = Router();

const locationController = require("../controller/locationController");

router.get("/characters/:characterName", locationController.getCharacter);

module.exports = router;
