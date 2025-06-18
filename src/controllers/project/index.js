const { PrismaClient } = require('@prisma/client')
const { verifyToken } = require('../../helpers/Jwt')
const { Response } = require('../../helpers/Response')
const AuthorizationValidation = require('../../helpers/authorizationValidation')

const prisma = new PrismaClient()

async function GetProject(req, res) {
  try {
    const { token, valid } = AuthorizationValidation(req)
    if (!valid) return Response(res, 401, 'Unauthorized')
    const accessToken = token
    const IdUser = verifyToken(accessToken)
    if (!IdUser) return Response(res, 401, 'Unauthorized')
    const project = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: IdUser.id },
          {
            memberships: {
              some: {
                userId: IdUser.id,
              },
            },
          },
        ],
        id: req.query.projectId,
      },
      select: {
        id: true,
        name: true,
        owner: {
          select: {
            id: true,
            email: true,
          },
        },
        memberships: true,
        created_at: true,
      },
    })
    Response(res, true, 'Get Project Successfully', { project })
  } catch (error) {
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

async function GetDetailProject(req, res) {
  const { id } = req.params
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: id,
      },
      select: {
        id: true,
        name: true,
        owner: {
          select: {
            id: true,
            email: true,
          },
        },
        memberships: true,
        created_at: true,
      },
    })
    Response(res, true, 'Get Project Successfully', { project })
  } catch (error) {
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

async function PostProject(req, res) {
  try {
    const { token, valid } = AuthorizationValidation(req)
    if (!valid) return Response(res, 401, 'Unauthorized')
    const accessToken = token
    const { name } = req.body
    const IdUser = verifyToken(accessToken)
    if (!IdUser) return Response(res, 401, 'Unauthorized')
    const project = await prisma.project.create({
      data: {
        name,
        ownerId: IdUser.id,
      },
    })
    const getProject = await prisma.project.findFirst({
      where: {
        id: project.id,
      },
      select: {
        id: true,
        name: true,
        owner: {
          select: {
            id: true,
            email: true,
          },
        },
        created_at: true,
      },
    })
    Response(res, true, 'Create Project Successfully', { project: getProject })
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

async function UpdateProject(req, res) {
  try {
    const id = req.params.id
    const { name } = req.body
    if (!id) return Response(res, 400, 'Bad Request')
    const project = await prisma.project.update({
      where: {
        id: id,
      },
      data: {
        name,
        updated_at: new Date(),
      },
    })
    Response(res, true, 'Update Project Successfully', { project })
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

async function DeleteProject(req, res) {
  try {
    const id = req.params.id
    if (!id) return Response(res, 400, 'Bad Request')
    const project = await prisma.project.delete({
      where: {
        id: id,
      },
    })
    Response(res, true, 'Delete Project Successfully', { project })
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
  GetProject,
  PostProject,
  DeleteProject,
  UpdateProject,
  GetDetailProject,
}
