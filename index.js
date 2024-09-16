require("dotenv/config");
const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');

const authRoute = require("./routes/auth");
const transactionRouter = require("./routes/transaction");
const authentication = require("./middleware/authentication");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("connect to mongo db");
  })
  .catch((err) => {
    console.error(err);
});

const app = express();

app.use(cors());
app.use(express.json());

console.log(authRoute);
app.get("/", (req, res) => {
  res.send("kkkk")
})

app.use("/api/auth", authRoute);
app.use(authentication);
app.use("/api/transactions", transactionRouter);

app.listen(3001, () => {
    console.log("Server running on port 3001");
});
