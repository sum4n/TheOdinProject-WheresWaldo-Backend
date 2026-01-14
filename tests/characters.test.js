const characters = require("../routes/characters");

const request = require("supertest");
const express = require("express");
const app = express();

app.use(express.json());
app.use("/api", characters);

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
      name: "Gameboard 1",
      imgUrl: "gameboard1.png",
    },
  });

  await prisma.character.createMany({
    data: [
      {
        name: "Waldo",
        xLeft: 10,
        xRight: 20,
        yTop: 20,
        yBottom: 30,
        imgUrl: "waldo.png",
        gameboardId: gameboard.id,
      },
      {
        name: "Wizard",
        xLeft: 33,
        xRight: 44,
        yTop: 55,
        yBottom: 66,
        imgUrl: "wizard.png",
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

describe("GET /characters", () => {
  it("returns all character names", async () => {
    const res = await request(app).get("/api/characters");
    // console.log(res.headers);
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toEqual(["Waldo", "Wizard"]);
  });

  it("returns 404 when no characters exist", async () => {
    await prisma.character.deleteMany();

    const res = await request(app).get("/api/characters");

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("No characters found");
  });
});

describe("GET /:boardId/characters", () => {
  it("returns all characters with specific boardId", async () => {
    const res = await request(app).get(`/api/${gameboard.id}/characters`);
    // console.log(res.body);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("returns empty array when no characters exist", async () => {
    await prisma.character.deleteMany();

    const res = await request(app).get(`/api/${gameboard.id}/characters`);

    expect(res.status).toBe(200);
    // expect(res.body.message).toBe("No characters found");
    expect(res.body).toEqual([]);
  });

  it("returns 404 when gameboard id is not found", async () => {
    const res = await request(app).get(`/api/${gameboard.id + 1}/characters`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("No gameboard found");
  });

  it("returns error when board id is not an integer", async () => {
    const res = await request(app).get("/api/badId/characters");
    // console.log(res.status);
    expect(res.status).toBe(400);
  });
});
