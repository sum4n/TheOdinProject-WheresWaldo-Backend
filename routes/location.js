const { Router } = require("express");
const router = Router();

const locationController = require("../controller/locationController");

router.get(
  "/characters/:characterName",
  locationController.checkCharacterLocation
);

module.exports = router;
