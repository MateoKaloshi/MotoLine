const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../Models/UserModel");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const tokenBlacklist = [];

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email!" });
    }

       if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password!" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // you may want to remove password field from user before sending:
    const userSafe = user.toObject ? user.toObject() : user;
    delete userSafe.password;

    res.json({ user: userSafe, token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message });
  }
};

// LOGOUT
exports.logout = (req, res) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
  tokenBlacklist.push(token);
  res.json({ message: "Logged out successfully" });
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const { first_name, last_name, password, email, phone_number, address } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check duplicate
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      first_name,
      last_name,
      email,
      phone_number,
      address,
      password: hashedPassword, 
    });

    await newUser.save();
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.tokenBlacklist = tokenBlacklist;
