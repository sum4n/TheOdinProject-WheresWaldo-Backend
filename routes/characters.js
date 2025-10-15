const { Router } = require("express");
const router = Router();

const characterController = require("../controller/characterController");

router.get("/characters", characterController.getAllCharacterNames);

router.get(
  "/characters/check/:characterName",
  characterController.checkCharacterLocation
);

module.exports = router;
