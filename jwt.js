const jwt = require('jsonwebtoken');

// Secret key for JWT token 
const secretKey = process.env.JWT_SECRET_KEY;

// Function to generate a JWT token
function generateToken(payload) {
  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
}

// Function to verify a JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, secretKey);
  } catch (error) {
    return null; // Token is invalid
  }
}

module.exports = {
  generateToken,
  verifyToken,
};
