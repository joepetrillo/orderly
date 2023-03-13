import express from "express";

const app = express();
const port = 3001;

app.get("/", (req, res) => {
  res.send("Hello World!!!");
});

app.listen(port, () => {
  console.log(`express server running on port ${port}`);
});
