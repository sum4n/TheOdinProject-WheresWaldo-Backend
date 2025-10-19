const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

exports.getGameAssets = async (req, res) => {
  const gameBoard = await prisma.gameboard.findFirst();

  res.status(200).json(gameBoard);
};
