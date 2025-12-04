const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

exports.getGameAssets = async (req, res) => {
  const gameBoard = await prisma.gameboard.findMany();
  const characters = await prisma.character.findMany({
    select: { id: true, name: true, imgUrl: true },
  });

  // set custom properties
  req.session.characterCount = characters.length;
  req.session.startTime = Date.now();

  // console.log(req.session);
  // console.log(characters);
  // console.log(gameBoard);

  res.status(200).json({ gameBoard, characters });
};
