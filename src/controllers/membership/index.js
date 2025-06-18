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
    const checkMembershipExisting = await prisma.membership.findMany({
      where: {
        userId: { in: userId },
        projectId: projectId,
      },
    })
    if (checkMembershipExisting.length > 0)
      return Response(res, false, 400, 'User already in project')
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    })
    if (!project) return Response(res, false, 404, 'Project not found')

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
    if (projectId) {
      const checkProject = await prisma.project.findMany({
        where: {
          id: projectId,
        },
      })
      if (checkProject.length === 0)
        return Response(res, false, 404, null, 'Project not found')
      console.log(checkProject)
    }
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
      where: {
        email: {
          contains: req.query.email,
        },
      },
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
    const { id } = req.params
    const existing = await prisma.membership.findUnique({
      where: { id },
    })

    if (!existing) {
      return Response(res, false, 'Membership not found')
    }
    const membership = await prisma.membership.delete({
      where: {
        id,
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
    const { id } = req.params
    const { userId, projectId } = req.body

    if (!id)
      return Response(res, false, 400, 'Missing projectId (in URL params)')
    if (!Array.isArray(userId) || userId.length === 0) {
      return Response(res, false, 400, 'userId must be a non-empty array')
    }

    const checkProject = await prisma.project.findUnique({
      where: { id: projectId },
    })
    if (!checkProject) return Response(res, false, 404, 'Project not found')

    const validUsers = await prisma.user.findMany({
      where: {
        id: {
          in: userId,
        },
      },
    })

    const validUserIds = validUsers.map((u) => u.id)
    if (validUserIds.length === 0) {
      return Response(res, false, 404, 'No valid users found')
    }

    const upserted = await Promise.all(
      validUserIds.map((uid) =>
        prisma.membership.upsert({
          where: {
            userId_projectId: {
              userId: uid,
              projectId: id,
            },
          },
          update: {
            updated_at: new Date(),
          },
          create: {
            userId: uid,
            projectId: id,
            updated_at: new Date(),
          },
        })
      )
    )

    Response(res, true, 'Update Membership Successfully', {
      membership: upserted,
    })
  } catch (error) {
    console.error(error)
    if (error.errors) {
      const errors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      return Response(res, false, 'Validation Error', {}, errors)
    }
    Response(res, false, 'Server Error', {}, error.message ?? error.toString())
  }
}

module.exports = {
  CreateMembership,
  GetMembership,
  getAllUser,
  DeleteMembership,
  UpdateMembership,
}
