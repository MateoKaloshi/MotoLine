const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../Models/UserModel");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const tokenBlacklist = [];

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).exec();
    if (!user) {
      return res.status(401).json({ message: 'Invalid email!' });
    }

    if (!user.password) {
      console.warn(`User ${user._id} has no password stored.`);
      return res.status(500).json({ message: 'User password not set. Contact support.' });
    }

    let isMatch;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (bcryptErr) {
      console.error('bcrypt.compare error:', bcryptErr && bcryptErr.stack ? bcryptErr.stack : bcryptErr);
      return res.status(500).json({ message: 'Error comparing passwords' });
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password!' });
    }

    // SIGN TOKEN
    let token;
    try {
      if (!JWT_SECRET) {
        console.warn('JWT_SECRET is not set; using fallback (development).');
      }
      token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    } catch (jwtErr) {
      console.error('jwt.sign error:', jwtErr && jwtErr.stack ? jwtErr.stack : jwtErr);
      return res.status(500).json({ message: 'Error generating token' });
    }

    const userSafe = typeof user.toObject === 'function' ? user.toObject() : { ...user };
    delete userSafe.password;

    return res.json({ user: userSafe, token });
  } catch (err) {
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

exports.authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    if (!token) return res.status(401).json({ message: "No token provided" });

    if (tokenBlacklist.includes(token)) return res.status(401).json({ message: "Token is revoked" });

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    try {
      const user = await User.findById(payload.id).exec();
      if (!user) return res.status(401).json({ message: "User not found" });
      const safeUser = typeof user.toObject === 'function' ? user.toObject() : user;
      delete safeUser.password;
      req.user = safeUser;
      next();
    } catch (err) {
      console.error('authenticateToken user fetch error', err);
      return res.status(500).json({ message: 'Server error' });
    }
  } catch (err) {
    console.error('authenticateToken error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
