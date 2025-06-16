const { PrismaClient } = require('@prisma/client')
const { Response } = require('../../helpers/Response')
const { verifyToken } = require('../../helpers/Jwt')

const prisma = new PrismaClient()

async function CreateTask(req, res) {
  try {
    const { title, description, projectId, status, assigneeId } = req.body
    const cookies = req.cookies
    if (!cookies.accessToken) return Response(res, 401, 'Unauthorized')

    const checkMembership = await prisma.membership.findFirst({
      where: {
        userId: assigneeId,
        projectId: projectId,
      },
    })
    if (!checkMembership)
      return Response(res, false, 401, 'User not in project')

    const accessToken = cookies.accessToken
    const IdUser = await verifyToken(accessToken)
    if (!IdUser) return Response(res, false, 401, 'Unauthorized')

    const checkProject = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    })
    if (!checkProject) return Response(res, false, 404, 'Project not found')

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        assignee: {
          connect: { id: assigneeId },
        },
        project: {
          connect: { id: projectId },
        },
      },
    })
    Response(res, true, 'Create Task Successfully', { task })
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

async function GetTaskDetail(req, res) {
  try {
    const { status } = req.query
    const tasks = await prisma.task.findFirst({
      where: {
        status,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        created_at: true,
        project: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })
    Response(res, true, 'Get Task Successfully', {
      tasks,
    })
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

async function GetTask(req, res) {
  try {
    const { status } = req.query
    const tasks = await prisma.task.findMany({
      where: {
        status,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        created_at: true,
        project: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })
    const totalCount = await prisma.task.count({
      where: {
        status,
      },
    })
    Response(res, true, 'Get Task Successfully', {
      tasks,
      meta: { totalCount },
    })
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

async function UpdateTask(req, res) {
  try {
    const { id } = req.params
    const { title, description, projectId, status, assigneeId } = req.body
    const cookies = req.cookies
    if (!cookies.accessToken) return Response(res, 401, 'Unauthorized')
    const accessToken = cookies.accessToken
    const IdUser = await verifyToken(accessToken)
    if (!IdUser) return Response(res, false, 401, 'Unauthorized')

    const checkProject = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    })
    if (!checkProject) return Response(res, false, 404, 'Project not found')

    const task = await prisma.task.update({
      where: {
        id: id,
      },
      data: {
        title,
        description,
        status,
        assignee: {
          connect: { id: assigneeId },
        },
        project: {
          connect: { id: projectId },
        },
      },
    })
    Response(res, true, 'Update Task Successfully', { task })
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

async function DeleteTask(req, res) {
  try {
    const id = req.params.id
    if (!id) return Response(res, 400, 'Bad Request')
    const task = await prisma.task.delete({
      where: {
        id: id,
      },
    })
    Response(res, true, 'Delete Task Successfully', { task })
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
  CreateTask,
  GetTask,
  UpdateTask,
  DeleteTask,
  GetTaskDetail,
}
