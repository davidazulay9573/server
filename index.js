require("dotenv/config");
const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');

const authRoute = require("./routes/auth");
const transactionRouter = require("./routes/transaction");
const userRouter = require("./routes/user");
const { seedDB } = require("./seed")

const authentication = require("./middleware/authentication");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("connect to mongo db");
  })
  .catch((err) => {
    console.error(err);
});

//  seedDB()

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoute);
app.use(authentication);
app.use("/api/transactions", transactionRouter);
app.use("/api/users", userRouter)

app.listen(3001, () => {
    console.log("Server running on port 3001");
});
