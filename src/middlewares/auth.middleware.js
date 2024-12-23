const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY; // Clave secreta para JWT

// Simulación de blacklist
const blacklist = [];

// Middleware para verificar si el token está en la blacklist
const checkBlacklist = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extraer token
  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  if (blacklist.includes(token)) {
    return res.status(401).json({ message: 'Token inválido o bloqueado' });
  }

  next();
};

// Middleware para autenticar el token
const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token inválido' });
    }
    req.user = decoded;
    next();
  });
};

module.exports = { authenticate, checkBlacklist, blacklist };
