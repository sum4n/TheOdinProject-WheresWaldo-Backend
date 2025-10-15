const express = require("express");
const app = express();

const characterRouter = require("./routes/characters");

app.use("/api", characterRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }

  console.log(`app is running on PORT: ${PORT}`);
});
