const User = require("../models/User");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// 📨 Send OTP
exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Transporter config using Gmail
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.EMAIL_PASS, // use app password if 2FA is enabled
    },
  });

  try {
    await transporter.sendMail({
      from: `"ChatnShop" <${process.env.EMAIL_ID}>`,
      to: email,
      subject: "Your ChatnShop OTP",
      text: `Your OTP is: ${otp}`,
    });

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email, otp });
    } else {
      user.otp = otp;
    }

    await user.save();
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// ✅ Verify OTP + create password
exports.verifyOtp = async (req, res) => {
  const { email, otp, password } = req.body;
  try {
    const user = await User.findOne({ email });
    console.log({user});
    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.verified = true;
    user.otp = null;
    await user.save();

    res.status(200).json({ message: "User verified and registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Verification failed" });
  }
};


exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !user.verified) {
      return res.status(400).json({ message: "User not found or not verified" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2h"
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: { email: user.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
};
