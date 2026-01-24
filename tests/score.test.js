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

app.get("/__test/session", (req, res) => {
  req.session.timeElapsed = 5.2;
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
        username: "userOne",
        time: 1.1,
        gameboardId: gameBoard.id,
      },
      {
        id: 2,
        username: "userTwo",
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

  it("returns scores list when scores are present", async () => {
    const res = await request(app).get(`/gameboards/${gameBoard.id}/score`);

    expect(res.status).toBe(200);
    expect(res.body.scores.length).toBe(2);
  });
});

describe("POST /gameboards/:boardId/score", () => {
  it("returns errors array if username is invalid", async () => {
    const res = await request(app)
      .post(`/gameboards/${gameBoard.id}/score`)
      .send({ username: "user123" })
      .set("Accept", "application/json");

    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.status).toBe(400);
    expect(res.body.message[0].msg).toEqual(
      "Username must only contain letters.",
    );
  });

  it("returns 400 error when invalid boardId is given", async () => {
    const res = await request(app)
      .post("/gameboards/invalidId/score")
      .send({ username: "user" })
      .set("Accept", "application/json");

    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.status).toBe(400);
    expect(res.body.error).toEqual("Invalid board id");
  });

  it("returns 500 status code if timeElapsed is not found in session", async () => {
    const res = await request(app)
      .post(`/gameboards/${gameBoard.id}/score`)
      .send({ username: "user" })
      .set("Accept", "applicaion/json");

    expect(res.status).toBe(500);
    expect(res.body.error).toEqual("Internal server error");
  });

  it("returns 200 and saves the score", async () => {
    const agent = request.agent(app);
    // adds req.session.timeElapsed
    await agent.get("/__test/session");

    const res = await agent
      .post(`/gameboards/${gameBoard.id}/score`)
      .send({ username: "UserThree" })
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(res.body.message).toEqual("success");
    expect(res.body.score).toBeDefined();
  });
});
