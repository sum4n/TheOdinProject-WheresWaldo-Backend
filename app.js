const express = require("express");
const app = express();

const characterRouter = require("./routes/characters");
const assetRouter = require("./routes/asset");

app.use("/api", characterRouter);
app.use("/api", assetRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }

  console.log(`app is running on PORT: ${PORT}`);
});
