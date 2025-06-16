const { z } = require('zod')
const hashingHmac = require('../../helpers/crypto')
const { PrismaClient } = require('@prisma/client')
const { Response } = require('../../helpers/Response')
const {
  generateAccessToken,
  generateRefreshToken,
} = require('../../helpers/Jwt')

const schema = z
  .object({
    email: z.string().email(),
    password: z.string().max(8),
  })
  .strict()

const prisma = new PrismaClient()

async function Register(req, res) {
  try {
    const { email, password } = req.body
    const checkEmail = await prisma.user.findUnique({
      where: {
        email: email,
      },
    })
    if (checkEmail) {
      Response(res, false, 'Error', {}, 'Email already exist', 400)
    }

    const hashPassword = await hashingHmac(password)
    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashPassword,
      },
    })

    if (!user) {
      Response(res, false, 'Error', {}, 'Something went wrong', 500)
    }

    const accessToken = generateAccessToken({ id: user.id }, '1d')
    const refreshToken = generateRefreshToken({ id: user.id }, '1d')

    Response(res, true, 'Register success', { accessToken, refreshToken })
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

module.exports = {
  Register,
}
