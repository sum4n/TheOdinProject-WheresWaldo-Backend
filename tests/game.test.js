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
  }),
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
        id: 1,
        name: "Waldo2",
        xLeft: 10,
        xRight: 20,
        yTop: 20,
        yBottom: 30,
        imgUrl: "waldo2.png",
        gameboardId: gameboard.id,
      },
      {
        id: 2,
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

describe("GET /game/:boardId/characters/:characterId", () => {
  it("returns error when no query parameters are given", async () => {
    const res = await request(app).get(
      `/api/game/${gameboard.id}/characters/1`,
    );

    // console.log(res.body);
    expect(res.status).toBe(400);
    expect(res.body.error).toEqual("Invalid query parameters");
  });

  it("returns error when invalid query parameters are given", async () => {
    const res = await request(app).get(
      `/api/game/${gameboard.id}/characters/1?left=abc&&top=dcc`,
    );

    expect(res.status).toBe(400);
    expect(res.body.error).toEqual("Invalid query parameters");
  });

  it("returns error when either top or left parameter is absent", async () => {
    const res = await request(app).get(
      `/api/game/${gameboard.id}/characters/1?left={1}`,
    );

    expect(res.status).toBe(400);
  });

  it("returns 400 error if boardId is not integer", async () => {
    const res = await request(app).get(
      "/api/game/aa/characters/1?left=1&&top=1",
    );

    // console.log(res.body);
    expect(res.status).toBe(400);
    expect(res.body.message).toEqual("boardId must be integer");
  });

  it("returns 400 error if characterId is not integer", async () => {
    const res = await request(app).get(
      "/api/game/1/characters/a?left=1&&top=1",
    );

    expect(res.status).toBe(400);
    expect(res.body.message).toEqual("characterId must be integer");
  });

  it("returns 404 not found error if no character is found", async () => {
    const characterId = 0;
    const res = await request(app).get(
      `/api/game/${gameboard.id}/characters/${characterId}?left=1&&top=1`,
    );

    expect(res.status).toBe(404);
    expect(res.body.error).toEqual(`Character not found`);
  });

  it("returns character not found if given position is wrong", async () => {
    const characterId = 1;
    const res = await request(app).get(
      `/api/game/${gameboard.id}/characters/${characterId}?left=1&&top=1`,
    );

    const character = await prisma.character.findFirst({
      where: {
        id: characterId,
        gameboardId: gameboard.id,
      },
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toEqual(false);
    expect(res.body.message).toEqual(`${character.name} not found`);
    expect(res.body.characterName).toEqual(character.name);
  });

  it("returns character found if given position is correct", async () => {
    const characterId = 1;
    const agent = request.agent(app);

    // needed for req.session.gameStartTime
    await agent.get(`/api/game/${gameboard.id}`);

    const res = await agent.get(
      `/api/game/${gameboard.id}/characters/${characterId}?left=15&&top=22`,
    );
    const character = await prisma.character.findFirst({
      where: {
        id: characterId,
        gameboardId: gameboard.id,
      },
    });

    // console.log(res.body);
    expect(res.status).toBe(200);
    expect(res.body.success).toEqual(true);
    expect(res.body.message).toEqual(`${character.name} found`);
    expect(res.body.characterName).toEqual(character.name);
    expect(res.body.timeElapsed).toBeCloseTo(0.01, 1);
    expect(res.body.allCharactersFound).toBe(false);
  });
});
