const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
require("dotenv").config();

const loginRoute = require("./routes/loginRoute");
const bikeRoute = require("./routes/bikesRoute");
const userRoute = require("./routes/userRoute");
const contactRouter = require("./routes/contactRoute");

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
app.use("/api", userRoute);
app.use("/api", loginRoute);
app.use("/api", bikeRoute);
app.use("/api", contactRouter);

app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader(
      "Access-Control-Allow-Origin",
      process.env.FRONTEND_ORIGIN || "http://localhost:3000"
    );
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/bikes", require("./routes/bikeImages"));

app.use("/", (req, res) => {
  res.send("Hello World");
});

app.listen(5000, () => {
  console.log("Server created");
});
