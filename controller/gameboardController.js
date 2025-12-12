const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

exports.getGameBoards = async (req, res) => {
  const gameBoards = await prisma.gameboard.findMany();
  res.status(200).json(gameBoards);
};
