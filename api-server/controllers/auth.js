const { User } = require("../models");
const hashPassword = require("../utils/hashPassword");
const comparePassword = require("../utils/comparePassword");
const generateToken = require("../utils/generateToken");

const signup = async (req, res, next) => {
  try {
    const { first_name, last_name, email, password, role } = req.body;

    const existingEmail = await User.findOne({ where: { email } });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = new User({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role,
    });

    const newUser = await user.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};

const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "User signed in successfully",
      data: {
        user: user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  signin,
};
