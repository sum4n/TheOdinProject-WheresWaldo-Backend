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
  // add timer here. don't wait for server check. if correct use it to find time elapsed.
  const currentTime = Date.now();
  // get click position form query parameters
  const { x: clickX, y: clickY } = req.query;
  // console.log({ clickX, clickY });

  // get the character name from path parameter
  const characterName = req.params.characterName;
  // get character details
  const character = await prisma.character.findUnique({
    where: { name: characterName },
  });

  // character does not exists
  if (!character) {
    return res.status(404).json({
      success: false,
      message: `Chracter ${characterName} not found`,
    });
  }

  // check if the click location is within the character box OR
  // click is on the character location box
  if (
    character &&
    clickX >= character.xLeft &&
    clickX <= character.xRight &&
    clickY >= character.yTop &&
    clickY <= character.yBottom
  ) {
    // decrease character count on a chracter found.
    req.session.characterCount -= 1;
    // console.log(req.session);

    res.status(200).json({
      success: true,
      message: `${character.name} found`,
      name: character.name,
      gameEnd: req.session.characterCount == 0, // when all characters are found
      timeElapsed:
        req.session.characterCount == 0
          ? ((currentTime - req.session.startTime) / 1000).toFixed(2)
          : null,
    });
  } else {
    res.status(200).json({
      success: false,
      message: `${character.name} not found`,
      name: character.name,
    });
  }
};
