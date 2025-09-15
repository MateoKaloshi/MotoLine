const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const app = express();
const userModel = require("./Models/UserModel");
const bikeModel = require("./Models/BikesModel");
const soldModel = require("./Models/SoldModel");
const imageModel = require("./Models/ImagesModel");

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

const user = userModel.create({
  first_name: "Mateo",
  last_name: "Kaloshi",
  phone_number: "12345678",
  adress: "Testvej 1",
  email: 'mateo@gmail.com',
  password: "12345678",
});

app.use("/", (req, res) => {
  res.send("Hello World");
});

app.listen(5000, () => {
  console.log("Server created");
});
