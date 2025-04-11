const jwt = require("jsonwebtoken");
const { jwt_secret } = require("../config/keys");

const isAuth = (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    
    if (!authorization) {
      return res.status(401).json({
        success: false,
        message: "Authentification requise"
      });
    }

    const token = authorization.split(" ")[1];
    const payload = jwt.verify(token, jwt_secret);

    req.user = {
      id: payload.id,
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email,
      role: payload.role
    };

    next();

  } catch (error) {
    console.error("Erreur authentification:", error);
    
    const status = error.name === 'TokenExpiredError' ? 401 : 500;
    const message = error.name === 'JsonWebTokenError' 
      ? "Token invalide" 
      : "Erreur d'authentification";

    res.status(status).json({
      success: false,
      message
    });
  }
};

module.exports = isAuth;