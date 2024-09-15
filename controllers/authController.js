const { promisify } = require("util");
const User = require("../models/userSchema");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "30d",
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    user,
  });
};

exports.signup = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    createSendToken(newUser, 201, res);
  } catch (err) {
    console.error("Error creating user:", err.message);
    res.status(400).send(err.message);
  }
};

exports.login = async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).send("Please provide Phone and Password");
  }

  const user = await User.findOne({ phone }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(401).send("Incorrect phone or password");
  }
  createSendToken(user, 200, res);
};

exports.protect = async (req, res, next) => {
  try {
    // 1) Getting token and checking if it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "You are not logged in! Please log in to get access.",
      });
    }

    // 2) Verify token
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET_KEY
    );

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: "fail",
        message: "The user belonging to this token no longer exists.",
      });
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  } catch (err) {
    // Handle invalid or expired token
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "fail",
        message: "Invalid token! Please log in again.",
      });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "fail",
        message: "Your token has expired! Please log in again.",
      });
    }
    // Handle any other errors
    return res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: `You don't have permission to do this`,
      });
    }

    next();
  };
};
