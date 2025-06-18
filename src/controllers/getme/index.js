const AuthorizationValidation = require('../../helpers/authorizationValidation')
const { Response } = require('../../helpers/Response')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function getMe(req, res) {
  const { valid, verify } = AuthorizationValidation(req)
  if (!valid) return res.status(401).json({ message: 'Unauthorized' })
  const profile = await prisma.user.findUnique({
    where: {
      id: verify.id,
    },
    select: {
      id: true,
      email: true,
      created_at: true,
    },
  })
  return Response(res, true, 'Success', { profile })
}

module.exports = { getMe }
