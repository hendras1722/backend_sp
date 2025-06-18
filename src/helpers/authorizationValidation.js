const { verifyToken } = require('./Jwt')

function AuthorizationValidation(req) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  const verify = verifyToken(token)
  return {
    valid: !!token,
    token,
    verify,
  }
}

module.exports = AuthorizationValidation
