const jwt = require('jsonwebtoken')
const { Response } = require('./Response')
const { verifyToken } = require('./Jwt')

require('dotenv').config()

async function auth(req, res, next) {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      throw new Error('Unauthorized')
    }
    if (token == null) Response(res, false, 'Error', {}, 'Unauthorized', 401)
    const verify = await verifyToken(token)
    if (!verify) Response(res, false, 'Error', {}, 'Unauthorized', 401)
    req.user = verify
    next()
  } catch (error) {
    console.log(error.response)

    if (error.errors) {
      const errors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }))

      Response(res, false, error.message, {}, errors, 400)
    }
    Response(res, false, error.message || error.toString(), {}, '', 400)
  }
}

module.exports = auth
