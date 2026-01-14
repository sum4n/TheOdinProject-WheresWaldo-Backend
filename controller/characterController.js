const prisma = require("../db/prisma");
const CustomNotFoundError = require("../errors/CustomNotFoundError");

exports.getAllCharacterNames = async (req, res) => {
  const allCharacterNames = await prisma.character.findMany({
    select: { name: true },
  });

  if (allCharacterNames.length === 0) {
    throw new CustomNotFoundError("No characters found");
  }

  const nameList = allCharacterNames.map((character) => character.name);

  res.status(200).json(nameList);
};

exports.getCharactersByBoardId = async (req, res) => {
  const boardId = parseInt(req.params.boardId);

  const characters = await prisma.character.findMany({
    where: { gameboardId: boardId },
    select: {
      id: true,
      name: true,
      imgUrl: true,
    },
  });

  res.status(200).json(characters);
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
    // save timeElapsed in req.session, so that scoreController does not have to rely on font-end for timeElapsed
    if (req.session.characterCount === 0) {
      req.session.timeElapsed = (
        (currentTime - req.session.startTime) /
        1000
      ).toFixed(2);
      // console.log(req.session.timeElapsed);
    }
    res.status(200).json({
      success: true,
      message: `${character.name} found`,
      name: character.name,
      gameEnd: req.session.characterCount == 0, // when all characters are found
      timeElapsed:
        // req.session.characterCount == 0
        //   ? ((currentTime - req.session.startTime) / 1000).toFixed(2)
        //   : null,
        ((currentTime - req.session.startTime) / 1000).toFixed(2),
    });
  } else {
    res.status(200).json({
      success: false,
      message: `${character.name} not found`,
      name: character.name,
    });
  }
};
