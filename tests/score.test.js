const score = require("../routes/score");

const request = require("supertest");
const express = require("express");
const session = require("express-session");
const app = express();

app.use(express.json());

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  }),
);

app.use("/", score);

app.get("__test/session", (req, res) => {
  res.json(req.session);
});

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    err: err.name || "Error",
    message: err.message || "Internal server error",
  });
});

const prisma = require("../db/prisma");

let gameBoard;

beforeEach(async () => {
  gameBoard = await prisma.gameboard.create({
    data: {
      id: 1,
      name: "gameboard",
      imgUrl: "gameboard.png",
    },
  });

  await prisma.score.createMany({
    data: [
      {
        id: 1,
        username: "user1",
        time: 1.1,
        gameboardId: gameBoard.id,
      },
      {
        id: 2,
        username: "user2",
        time: 2.2,
        gameboardId: gameBoard.id,
      },
    ],
  });
});

afterEach(async () => {
  await prisma.score.deleteMany();
  await prisma.gameboard.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("GET /gameboards/:boardId/score", () => {
  it("returns 400 when invalid boardId given", async () => {
    const res = await request(app).get("/gameboards/abc/score");

    expect(res.status).toBe(400);
    expect(res.body.error).toEqual("Invalid boardId");
    expect(res.body.message).toEqual("BoardId must be integer");
  });

  it("returns empty list when wrong boardId is given", async () => {
    const res = await request(app).get(`/gameboards/${gameBoard.id + 1}/score`);

    expect(res.status).toBe(200);
    expect(res.body.scores).toEqual([]);
  });
});
