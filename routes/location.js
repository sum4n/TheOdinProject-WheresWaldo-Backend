const { Router } = require("express");
const router = Router();

const locationController = require("../controller/locationController");

router.get(
  "/check-location/:characterName",
  locationController.checkCharacterLocation
);

module.exports = router;
