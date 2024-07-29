// middleware/authMiddleware.js
const { auth } = require('../firebase');

const authenticate = async (req, res, next) => {

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).send({ error: 'No se proporcionó un token' });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.uid = decodedToken.uid;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Token no válido' });
  }
};

module.exports = authenticate;
