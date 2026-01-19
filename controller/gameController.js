const prisma = require("../db/prisma");
const CustomNotFoundError = require("../errors/CustomNotFoundError");

// starts game by adding gameStartTime and number of characters
// to be found in session
exports.startGame = async (req, res) => {
  const boardId = Number(req.params.boardId);
  if (!Number.isInteger(boardId)) {
    return res.status(400).json({ error: "Invalid board id" });
  }

  let gameBoard = await prisma.gameboard.findUnique({
    where: {
      id: boardId,
    },
    include: {
      characters: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!gameBoard) {
    throw new CustomNotFoundError("Board not found");
  }

  if (gameBoard.characters.length === 0) {
    throw new CustomNotFoundError("Board has no characters");
  }

  // set game start time in session
  req.session.gameStartTime = Date.now();
  const gameStartTime = req.session.gameStartTime;

  const characters = gameBoard.characters;
  // add characters length in session
  // needed to track when game ends
  req.session.charactersToBeFound = characters.length;

  // console.log(req.session);

  res.status(200).json({ message: "Game started", gameStartTime });
};

// gamePlay logic
// checks character location, adds and updates timeElapsed when
// a character is found.
// checks if all characters are found
exports.gamePlay = async (req, res) => {
  if (req.session.charactersToBeFound === 0) {
    return res.status(400).json({
      error: "The game has ended",
      message: "Already all characters have been found",
    });
  }
  // to calculate time elapsed. set as soon as request is received
  const currentTime = Date.now();

  // get click location from query parameters
  const left = Number(req.query.left);
  const top = Number(req.query.top);

  if (!left || !top || Number(left) === NaN || Number(top) === NaN) {
    return res.status(400).json({
      error: "Invalid query parameters",
      message:
        "Both 'left' and'top' query parameters are required and must be numeric values",
    });
  }

  const boardId = Number(req.params.boardId);
  const characterId = Number(req.params.characterId);

  if (!Number.isInteger(boardId)) {
    return res.status(400).json({
      error: "Invalid boardId",
      message: "boardId must be integer",
    });
  }

  if (!Number.isInteger(characterId)) {
    return res.status(400).json({
      error: "Invalid characterId",
      message: "characterId must be integer",
    });
  }

  const character = await prisma.character.findFirst({
    where: {
      id: characterId,
      gameboardId: boardId,
    },
  });

  if (!character) {
    return res.status(404).json({
      error: `Character not found`,
    });
  }

  const isLocationCorrect = checkLocation(character, left, top);

  if (isLocationCorrect) {
    req.session.charactersToBeFound--;
    const timeElapsed = (
      (currentTime - req.session.gameStartTime) /
      1000
    ).toFixed(2);

    return res.status(200).json({
      success: true,
      message: `${character.name} found`,
      characterName: character.name,
      timeElapsed: Number(timeElapsed),
      allCharactersFound: req.session.charactersToBeFound === 0,
    });
  } else {
    return res.status(200).json({
      success: false,
      message: `${character.name} not found`,
      characterName: character.name,
    });
  }
};

function checkLocation(character, left, top) {
  if (
    left >= character.xLeft &&
    left <= character.xRight &&
    top >= character.yTop &&
    top <= character.yBottom
  ) {
    return true;
  } else {
    return false;
  }
}
