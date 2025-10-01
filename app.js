const express = require("express");
const app = express();

const locationRouter = require("./routes/location");

app.use("/api", locationRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }

  console.log(`app is running on PORT: ${PORT}`);
});
