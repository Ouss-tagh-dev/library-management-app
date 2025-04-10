const jwt = require("jsonwebtoken");
const { jwt_secret } = require("../config/keys");

const generateToken = (user) => {
  const token = jwt.sign(
    {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
    },
    jwt_secret,
    { expiresIn: "7d" }
  );
  return token;
};

module.exports = generateToken;
