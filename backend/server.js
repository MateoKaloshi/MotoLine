const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();

const loginRoute = require("./routes/loginRoute");
const bikeRoute = require("./routes/bikesRoute");


app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
    exposedHeaders: ["set-cookie"],
  })
);
app.use(
  session({
    secret: "This will be secret",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  })
);
app.use(express.json({ limit: "1000mb", extended: true }));

mongoose
  .connect(
    "mongodb+srv://Teo:mateo@motolinedb.yqk6rjx.mongodb.net/?retryWrites=true&w=majority&appName=MotoLineDB"
  )
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB not connected " + err));

app.use("/api", loginRoute);
app.use("/api", bikeRoute);


app.use("/", (req, res) => {
  res.send("Hello World");
});

app.listen(5000, () => {
  console.log("Server created");
});
