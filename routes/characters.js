const { Router } = require("express");
const router = Router();

const locationController = require("../controller/characterController");

router.get(
  "/check-location/:characterName",
  locationController.checkCharacterLocation
);

module.exports = router;
