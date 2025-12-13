const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

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
      return res.json({ message: errors.array() });
    }
    const { username } = matchedData(req);
    // get timeElapsed from req.session
    const timeElapsed = parseFloat(req.session.timeElapsed);

    const boardId = parseInt(req.params.boardId);

    if (req.session.rank <= 20) {
      // remove the 20th rank score, it will keep 20 score records in the database.
      if (req.session.scoreToRemove) {
        await prisma.score.delete({
          where: { id: req.session.scoreToRemove.id },
        });
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
  const boardId = parseInt(req.params.boardId);

  const scores = await prisma.score.findMany({
    orderBy: { time: "asc" },
    where: { gameboardId: boardId },
  });

  const timeElapsed = parseFloat(req.session.timeElapsed);
  // console.log({ timeElapsed });
  // console.log({ lastScore: scores[scores.length - 1] });

  // calculate ranking of the score.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findLastIndex
  let indexOfLastScore = scores.findLastIndex((score) => {
    return score.time <= timeElapsed;
  });
  let rank = indexOfLastScore + 2;

  // needed for saveScore
  req.session.rank = rank;
  if (scores.length == 20) {
    req.session.scoreToRemove = scores[scores.length - 1];
  }

  // console.log(req.session.scoreToRemove);

  // console.log({ rank });

  res.json({ scores, timeElapsed, rank });
};
