require("dotenv/config");
const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const authRoute = require("./routes/auth") ;

const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("connect to mongo db");
  })
  .catch((err) => {
    console.error(err);
});

const app = express();

app.use(cors());
app.use(express.json());


app.use("/auth", authRoute);


app.listen(3001, () => {
    console.log("Server running on port 3001");
});
