const bcrypt = require("bcrypt");
const User = require("../Models/UserModel");
const jwt = require("jsonwebtoken");

//GET PROFILE
const getProfile = async (req, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Not authenticated" });
    const { password, __v, ...safeUser } = req.user.toObject
      ? req.user.toObject()
      : req.user;
    return res.status(200).json({ user: safeUser });
  } catch (error) {
    console.error("getProfile error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// EDIT PROFILE
const updateProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const { first_name, last_name, adress, phone_number } = req.body || {};
    const updates = { first_name, last_name, adress, phone_number };

    Object.keys(updates).forEach(
      (key) =>
        (typeof updates[key] !== "string" || !updates[key].trim()) &&
        delete updates[key]
    );

    if (Object.keys(updates).length === 0)
      return res
        .status(400)
        .json({ message: "No valid fields provided to update" });

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
      select: "-password -__v",
    });

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });
    return res
      .status(200)
      .json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// CHANGE EMAIL
const updateEmail = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const { email, newEmail } = req.body || {};
    if (!email || !newEmail)
      return res
        .status(400)
        .json({ message: "Both current and new emails are required" });

    // EMAIL CHECK
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || !emailRegex.test(newEmail))
      return res.status(400).json({ message: "Invalid email format" });

    const user = await User.findById(userId).exec();
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.email.toLowerCase() !== email.toLowerCase())
      return res.status(400).json({ message: "Current email is incorrect" });

    if (user.email.toLowerCase() === newEmail.toLowerCase())
      return res
        .status(400)
        .json({ message: "New email is the same as current" });

    // CASE IN-SENSITIVE CHECK FOR DUPLICATES
    const existing = await User.findOne({
      email: new RegExp(`^${newEmail}$`, "i"),
    }).exec();
    if (existing && String(existing._id) !== String(user._id))
      return res.status(400).json({ message: "Email already in use" });

    user.email = newEmail.trim();
    await user.save();

    const { password, __v, ...safeUser } = user.toObject();
    return res
      .status(200)
      .json({ message: "Email updated successfully", user: safeUser });
  } catch (error) {
    console.error("updateEmail error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// CHANGE PASSWORD
const changePassword = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const { currentPassword, newPassword, confirmPassword } = req.body || {};
    if (!currentPassword || !newPassword || !confirmPassword)
      return res
        .status(400)
        .json({ message: "All password fields are required" });

    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "New passwords do not match" });

    if (newPassword.length < 6)
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });

    const user = await User.findById(userId).select("+password").exec();
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match)
      return res.status(400).json({ message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    const { password, __v, ...safeUser } = user.toObject();
    return res
      .status(200)
      .json({ message: "Password updated", user: safeUser });
  } catch (error) {
    console.error("changePassword error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

module.exports = { getProfile, updateProfile, updateEmail, changePassword };
