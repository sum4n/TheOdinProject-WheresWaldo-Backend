const prisma = require("../db/prisma");
const CustomNotFoundError = require("../errors/CustomNotFoundError");

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
  req.session.charactersToBeFound = characters.length;

  // console.log(req.session);

  res.status(200).json({ message: "Game started", gameStartTime });
};
