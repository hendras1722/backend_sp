const jwt = require('jsonwebtoken')

require('dotenv').config()
function generateAccessToken(payload, expired = '5h') {
  return jwt.sign(payload, process.env.JWT_KEY, { expiresIn: expired })
}

function generateRefreshToken(payload, expired = '5h') {
  return jwt.sign(payload, process.env.JWT_SECRET_REFRESH, {
    expiresIn: expired,
  })
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_KEY)
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
}
