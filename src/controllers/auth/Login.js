const jwt = require('jsonwebtoken')
const hashingHmac = require('../../helpers/crypto')
const { ResponseSuccess, Response } = require('../../helpers/Response')
const { z } = require('zod')
const { PrismaClient } = require('@prisma/client')
const {
  generateRefreshToken,
  generateAccessToken,
} = require('../../helpers/Jwt')

const schema = z
  .object({
    email: z.string().email(),
    password: z.string(),
  })
  .strict()

const prisma = new PrismaClient()

async function Login(req, res) {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    })

    if (!user) {
      Response(res, false, 'Error', {}, 'User not found', 404)
    }
    const hashPassword = await hashingHmac(password)

    if (hashPassword !== user.password) {
      Response(res, false, 'Error', {}, 'Password incorrect', 401)
    }
    const accessToken = await generateAccessToken({
      id: user.id,
    })

    const refreshToken = await generateRefreshToken({
      id: user.id,
    })

    res.cookie('accessToken', accessToken, {
      sameSite: 'lax',
    })

    res.cookie('refreshToken', refreshToken, {
      sameSite: 'lax',
    })

    Response(res, true, 'Login success', { accessToken, refreshToken })
  } catch (error) {
    console.log(error.response)
    if (error.errors) {
      const errors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      return Response(res, false, 'Error', {}, errors)
    }
    Response(res, false, 'Error', {}, error.message ?? error.toString())
  }
}

module.exports = Login
