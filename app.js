const express = require("express");
const session = require("express-session");
const cors = require("cors");
const prisma = require("./db/prisma");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");

const app = express();

app.use(express.json());

app.set("trust proxy", 1);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN_URL,
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60,
      partitioned: true,
      secure: true,
      sameSite: "none",
    },
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  }),
);

const gameboardRouter = require("./routes/gameboard");
const scoreRouter = require("./routes/score");
const gameRouter = require("./routes/game");
const rankRouter = require("./routes/rank");

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }

  console.log(`App is running on port: ${PORT}`);
});
