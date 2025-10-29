const express = require("express");
const session = require("express-session");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET"],
  })
);

app.use(
  session({
    secret: "waldo-secre",
    resave: false,
    saveUninitialized: false,
  })
);

const characterRouter = require("./routes/characters");
const assetRouter = require("./routes/asset");
const scoreRouter = require("./routes/score");

app.use("/api", characterRouter);
app.use("/api", assetRouter);
app.use("/api", scoreRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }

  console.log(`app is running on PORT: ${PORT}`);
});
