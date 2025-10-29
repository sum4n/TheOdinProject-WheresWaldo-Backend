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

    // save username and score into database
    const score = await prisma.score.create({
      data: {
        username: username,
        time: timeElapsed,
      },
    });

    res.json({ message: "success", score });
  },
];

exports.getScore = async (req, res) => {
  const scores = await prisma.score.findMany({
    orderBy: { time: "asc" },
  });

  res.json(scores);
};
