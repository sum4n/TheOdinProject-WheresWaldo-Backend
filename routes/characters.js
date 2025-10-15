const { Router } = require("express");
const router = Router();

const locationController = require("../controller/characterController");

router.get("/characters", locationController.getAllCharacterNames);

router.get(
  "/characters/check/:characterName",
  locationController.checkCharacterLocation
);

module.exports = router;
