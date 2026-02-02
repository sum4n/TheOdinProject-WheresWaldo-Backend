const express = require("express");
const session = require("express-session");
const cors = require("cors");

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST"],
  }),
);

app.use(
  session({
    secret: "waldo-secre",
    resave: false,
    saveUninitialized: false,
  }),
);

const characterRouter = require("./routes/characters");
const gameboardRouter = require("./routes/gameboard");
const scoreRouter = require("./routes/score");
const gameRouter = require("./routes/game");
const rankRouter = require("./routes/rank");

app.use("/api", characterRouter);
app.use("/api", gameboardRouter);
app.use("/api", scoreRouter);
app.use("/api", gameRouter);
app.use("/api", rankRouter);

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.statusCode || 500).json({
    error: err.name || "Error",
    message: err.message || "Internal Server Error",
    code: err.code || undefined,
  });
});

module.exports = app;
