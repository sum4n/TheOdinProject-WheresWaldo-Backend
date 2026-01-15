const game = require("../routes/game");

const request = require("supertest");
const express = require("express");
const session = require("express-session");
const app = express();

app.use(express.json());
app.use(
  session({
    secret: "waldo-secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use("/api", game);

app.get("/__test/session", (req, res) => {
  res.json(req.session);
});

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    error: err.name || "Error",
    message: err.message || "Internal Server Error",
  });
});

const prisma = require("../db/prisma");

let gameboard;
beforeEach(async () => {
  gameboard = await prisma.gameboard.create({
    data: {
      name: "Gameboard 2",
      imgUrl: "gameboard2.png",
    },
  });

  await prisma.character.createMany({
    data: [
      {
        name: "Waldo2",
        xLeft: 10,
        xRight: 20,
        yTop: 20,
        yBottom: 30,
        imgUrl: "waldo2.png",
        gameboardId: gameboard.id,
      },
      {
        name: "Wizard2",
        xLeft: 33,
        xRight: 44,
        yTop: 55,
        yBottom: 66,
        imgUrl: "wizard2.png",
        gameboardId: gameboard.id,
      },
    ],
  });
});

afterEach(async () => {
  await prisma.character.deleteMany();
  await prisma.gameboard.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("GET /game/:boardId", () => {
  it("returns error on invalid boardId", async () => {
    const res = await request(app).get("/api/game/1abc");

    // console.log(res.body);
    expect(res.status).toBe(400);
    expect(res.body.error).toEqual("Invalid board id");
  });

  it("returns 404 when gameboard with id not found", async () => {
    await prisma.gameboard.delete({
      where: {
        name: gameboard.name,
      },
    });
    const res = await request(app).get(`/api/game/${gameboard.id}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual("Board not found");
  });

  it("returns 404 when gameboard has no characters", async () => {
    await prisma.character.deleteMany({
      where: {
        gameboardId: gameboard.id,
      },
    });
    const res = await request(app).get(`/api/game/${gameboard.id}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toEqual("Board has no characters");
  });

  it("returns game start message with time-stamp", async () => {
    const res = await request(app).get(`/api/game/${gameboard.id}`);

    // console.log(res.body);
    expect(res.status).toBe(200);
    expect(res.body.message).toEqual("Game started");
    expect(res.body).toHaveProperty("gameStartTime");
  });

  it("contains gameStartTime and charactersToBeFound in session", async () => {
    const agent = request.agent(app);

    await agent.get(`/api/game/${gameboard.id}`);
    const res = await agent.get("/__test/session");

    // console.log(res.body);
    expect(res.body.gameStartTime).toBeDefined();
    expect(res.body.charactersToBeFound).toBe(2);
  });
});
