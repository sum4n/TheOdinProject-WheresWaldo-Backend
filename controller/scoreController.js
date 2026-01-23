const prisma = require("../db/prisma");

const { body, validationResult, matchedData } = require("express-validator");

const validateData = [
  body("username")
    .trim()
    .notEmpty()
    .isAlpha()
    .withMessage("Username must only contain letters."),
];

exports.saveScore = [
  validateData,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }
    const { username } = matchedData(req);

    const boardId = Number(req.params.boardId);
    if (!Number.isInteger(boardId)) {
      return res.status(400).json({ error: "Invalid board id" });
    }

    // get timeElapsed from req.session
    const timeElapsed = Number(req.session.timeElapsed);
    if (!timeElapsed) {
      return res.status(500).json({ error: "Internal server error" });
    }

    if (req.session.rank <= 20) {
      // remove the 20th rank score, it will keep 20 score records in the database.
      if (req.session.scoreToRemove) {
        await prisma.score.delete({
          where: { id: req.session.scoreToRemove.id },
        });
        delete req.session.scoreToRemove;
      }

      // save username and score into database if rank is less than or eaual to 20
      const score = await prisma.score.create({
        data: {
          username: username,
          time: timeElapsed,
          gameboardId: boardId,
        },
      });

      res.json({ message: "success", score });
    }
  },
];

exports.getScore = async (req, res) => {
  const boardId = Number(req.params.boardId);
  if (!Number.isInteger(boardId)) {
    return res.status(400).json({
      error: "Invalid boardId",
      message: "BoardId must be integer",
    });
  }

  const scores = await prisma.score.findMany({
    orderBy: { time: "asc" },
    where: { gameboardId: boardId },
    take: 30,
  });

  res.status(200).json({ scores });
};
