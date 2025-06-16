const { createHmac } = require('crypto')

require('dotenv').config()
function hashingHmac(message) {
  const SECRET = process.env.SECRET_KEY
  const hmac = createHmac('sha256', SECRET)
  hmac.update(message)

  const hashedMessage = hmac.digest('base64')

  return hashedMessage
}

module.exports = hashingHmac
