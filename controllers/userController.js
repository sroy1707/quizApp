const User = require("../models/userSchema");

exports.createUser = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).send(newUser);
  } catch (err) {
    console.error("Error creating user:", err.message);
    res.status(400).send(err.message);
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    if (users.length === 0) {
      return res.status(404).send("No users found.");
    }
    res.status(200).json({ status: "success", length: users.length, users });
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).send("Server error. Please try again later.");
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.status(200).send(user);
  } catch (err) {
    console.error("Error fetching user by id:", err.message);
    res.status(500).send("An error occurred while fetching the user.");
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: updatedUser,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.deleteUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
      data: deletedUser,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};
