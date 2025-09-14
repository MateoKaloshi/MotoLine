const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const app = express();


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
    "mongodb+srv://test:test@cluster0.f1fjugu.mongodb.net/mernproject?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB not connected " + err));

app.use(contactRoute);

app.use("/", (req, res) => {
  res.send("Hello World");
});

app.listen(5000, () => {
  console.log("Server created");
});
