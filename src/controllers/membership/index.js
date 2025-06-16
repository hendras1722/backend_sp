const { PrismaClient } = require('@prisma/client')
const { Response } = require('../../helpers/Response')
const { z } = require('zod')

const prisma = new PrismaClient()

const schema = z
  .object({
    userId: z.array(z.string().uuid()).min(1),
    projectId: z.string(),
  })
  .strict()

async function CreateMembership(req, res) {
  try {
    const { userId, projectId } = req.body
    const { success, error } = schema.safeParse({ userId, projectId })

    if (!success) {
      const errors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      return Response(res, false, 'Validation Error', {}, errors)
    }
    const users = await prisma.user.findMany({
      where: {
        id: { in: userId },
      },
    })
    if (users.length !== userId.length)
      return Response(res, false, 404, 'Some user(s) not found')

    const checkProjectId = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    })
    if (!checkProjectId) return Response(res, false, 404, 'Project not found')
    const data = userId.map((userId) => ({
      userId,
      projectId,
    }))
    const membership = await prisma.membership.createMany({
      data,
      skipDuplicates: true,
    })
    if (membership.count === 0)
      return Response(res, false, 'User already in project')
    Response(res, true, 'Create Membership Successfully', {})
  } catch (error) {
    console.log(error.response)
    if (error?.errors && Array.isArray(error.errors)) {
      const errors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      return Response(res, false, 'Error', {}, errors)
    }
    Response(res, false, 'Error', {}, error.message ?? error.toString())
  }
}

async function GetMembership(req, res) {
  try {
    const { projectId } = req.query
    const membership = await prisma.membership.findMany({
      where: {
        projectId: projectId,
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
    Response(res, true, 'Get Membership Successfully', { membership })
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

async function getAllUser(req, res) {
  try {
    const user = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        created_at: true,
      },
    })
    Response(res, true, 'Get User Successfully', { user })
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

async function DeleteMembership(req, res) {
  try {
    const { projectId } = req.query
    const { userId } = req.body
    const membership = await prisma.membership.deleteMany({
      where: {
        userId: {
          in: userId,
        },
        projectId: projectId,
      },
    })
    Response(res, true, 'Delete Membership Successfully', { membership })
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

async function UpdateMembership(req, res) {
  try {
    const { projectId } = req.query
    const { userId } = req.body
    const membership = await prisma.membership.updateMany({
      where: {
        userId: {
          in: userId,
        },
        projectId: projectId,
      },
      data: {
        projectId: projectId,
        userId: userId,
      },
    })
    Response(res, true, 'Update Membership Successfully', { membership })
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
  CreateMembership,
  GetMembership,
  getAllUser,
  DeleteMembership,
  UpdateMembership,
}
