const becrypt = require("bcryptjs");

const comparePassword = async (password, hash) => {
  try {
    const isMatch = await becrypt.compare(password, hash);
    return isMatch;
  } catch (error) {
    throw new Error("Error comparing password");
  }
};

module.exports = comparePassword;
