const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

exports.getAllCharacterNames = async (req, res) => {
  const allCharacterNames = await prisma.character.findMany({
    select: { name: true },
  });

  const nameList = [];
  allCharacterNames.forEach((name) => {
    nameList.push(name.name);
  });

  res.status(200).json(nameList);
};

exports.checkCharacterLocation = async (req, res) => {
  // get click position form query parameters
  const { x: clickX, y: clickY } = req.query;
  console.log({ clickX, clickY });

  // get the character name from path parameter
  const characterName = req.params.characterName;
  // get character details
  const character = await prisma.character.findUnique({
    where: { name: characterName },
  });

  // check if the click location is within the character box OR
  // click is on the character location box
  if (character && clickX >= character.xLeft && clickX <= character.xRight) {
    if (clickY >= character.yTop && clickY <= character.yBottom) {
      res.status(200).json({
        success: true,
        message: `${character.name} found`,
        name: character.name,
      });
    }
  }

  // If the click is not on the character box
  if (character) {
    res.status(200).json({
      success: false,
      message: `${character.name} not found`,
      name: character.name,
    });
  } else {
    res.status(200).json({ success: false, message: "Wrong search" });
  }
};
