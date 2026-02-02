const prisma = require("../db/prisma");

exports.getRank = async (req, res) => {
  const boardId = Number(req.params.boardId);
  if (!Number.isInteger(boardId)) {
    return res.status(400).json({
      error: "Invalid boardId",
      message: "BoardId must be integer",
    });
  }

  // get timeElapsed from req.session
  const timeElapsed = Number(req.session.timeElapsed);
  if (!timeElapsed) {
    return res.status(400).json({
      error: "Invalid session",
      message: "timeElapsed is not defined in session",
    });
  }

  // are all the characters found
  if (req.session.charactersToBeFound !== 0) {
    return res.status(400).json({
      error: "Game not finished",
      message: "All characters are not found",
    });
  }

  const scores = await prisma.score.findMany({
    orderBy: { time: "asc" },
    where: { gameboardId: boardId },
    take: 30,
  });

  if (scores.length === 0) {
    return res.status(200).json({ rank: 1, timeElapsed });
  }

  const rank = calculateRank(scores, timeElapsed);

  res.status(200).json({ rank, timeElapsed });
};

function calculateRank(array, time) {
  // time is greater than the all the saved time in the array
  if (time > array[array.length - 1].time) {
    return array.length + 1;
  }
  const index = array.findIndex((item) => {
    return item.time > time;
  });

  // rank is index of the first big element + 1
  return index + 1;
}
