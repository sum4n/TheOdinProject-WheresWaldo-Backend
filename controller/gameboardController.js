const prisma = require("../db/prisma");

exports.getGameBoards = async (req, res) => {
  const gameBoards = await prisma.gameboard.findMany({
    include: {
      characters: {
        select: {
          id: true,
          name: true,
          imgUrl: true,
        },
      },
    },
  });
  res.status(200).json(gameBoards);
};
