const rank = require("../routes/rank");

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

app.use("/", rank);
app.use("/__test/session/rankFour", (req, res) => {
  req.session.timeElapsed = 4;
  req.session.charactersToBeFound = 0;
  res.status(200).json(req.session);
});
app.use("/__test/session/rankOne", (req, res) => {
  req.session.timeElapsed = 0.1;
  req.session.charactersToBeFound = 0;
  res.status(200).json(req.session);
});
app.use("/__test/session/characterPresent", (req, res) => {
  req.session.timeElapsed = 0.1;
  req.session.charactersToBeFound = 2;
  res.status(200).json(req.session);
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
});

afterEach(async () => {
  await prisma.score.deleteMany();
  await prisma.gameboard.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("GET /gameboards/:boardId/rank", () => {
  it("returns 400 if boardId is invalid", async () => {
    const res = await request(app).get(`/gameboards/abc/rank`);

    expect(res.status).toBe(400);
    expect(res.body.error).toEqual("Invalid boardId");
    expect(res.body.message).toEqual("BoardId must be integer");
  });

  it("returns error if timeElapsed is not present in the session", async () => {
    const agent = request.agent(app);
    const res = await agent.get(`/gameboards/${gameBoard.id}/rank`);

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual("timeElapsed is not defined in session");
  });

  it("returns error if there are characters to be found", async () => {
    const agent = request.agent(app);
    await agent.get("/__test/session/characterPresent");
    const res = await agent.get(`/gameboards/${gameBoard.id}/rank`);

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual("All characters are not found");
  });

  it("returns rank 1 on if score is empty", async () => {
    const agent = request.agent(app);
    await agent.get("/__test/session/rankFour");
    const res = await agent.get(`/gameboards/${gameBoard.id}/rank`);

    expect(res.status).toBe(200);
    expect(res.body.rank).toBe(1);
  });

  it("returns correct rank", async () => {
    await prisma.score.createMany({
      data: [
        {
          id: 1,
          username: "userOne",
          time: 5.0,
          gameboardId: gameBoard.id,
        },
        {
          id: 2,
          username: "userTwo",
          time: 3.0,
          gameboardId: gameBoard.id,
        },
        {
          id: 3,
          username: "userThree",
          time: 1.0,
          gameboardId: gameBoard.id,
        },
        {
          id: 4,
          username: "userFour",
          time: 2.0,
          gameboardId: gameBoard.id,
        },
      ],
    });
    const agent = request.agent(app);
    // add session object
    await agent.get("/__test/session/rankFour");
    const res1 = await agent.get(`/gameboards/${gameBoard.id}/rank`);

    await agent.get("/__test/session/rankOne");
    const res2 = await agent.get(`/gameboards/${gameBoard.id}/rank`);

    expect(res1.status).toBe(200);
    expect(res1.body.rank).toBe(4);
    expect(res1.body.timeElapsed).toBe(4);

    expect(res2.status).toBe(200);
    expect(res2.body.rank).toBe(1);
    expect(res2.body.timeElapsed).toBe(0.1);
  });
});
