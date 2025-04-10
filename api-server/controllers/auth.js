const { User } = require("../models");
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

    const user = new User({ first_name, last_name, email, password, role });
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

module.exports = {
  signup,
};
