const express = require('express')
const Login = require('../controllers/auth/Login')
const { Register } = require('../controllers/auth/Register')
const {
  GetProject,
  PostProject,
  DeleteProject,
  UpdateProject,
  GetDetailProject,
} = require('../controllers/project')
const {
  CreateTask,
  GetTask,
  UpdateTask,
  DeleteTask,
  GetTaskDetail,
} = require('../controllers/task')
const auth = require('../helpers/auth')
const {
  CreateMembership,
  GetMembership,
  getAllUser,
  DeleteMembership,
  UpdateMembership,
} = require('../controllers/membership')
const { getMe } = require('../controllers/getme')

const Routes = express.Router()

// auth
Routes.post('/auth/login', Login)
Routes.post('/auth/register', Register)

// project
Routes.get('/project', auth, GetProject)
Routes.post('/project', auth, PostProject)
Routes.delete('/project/:id', auth, DeleteProject)
Routes.get('/project/:id', auth, GetDetailProject)
Routes.put('/project/:id', auth, UpdateProject)

// task
Routes.post('/task', auth, CreateTask)
Routes.get('/task', auth, GetTask)
Routes.get('/task/:id', auth, GetTaskDetail)
Routes.put('/task/:id', auth, UpdateTask)
Routes.delete('/task/:id', auth, DeleteTask)

// membership
Routes.post('/membership', auth, CreateMembership)
Routes.get('/membership', auth, GetMembership)
Routes.delete('/membership/:id', auth, DeleteMembership)
Routes.put('/membership/:id', auth, UpdateMembership)

// user
Routes.get('/user', auth, getAllUser)

//getMe
Routes.get('/me', auth, getMe)

// test
Routes.get('/test', (req, res) => {
  res.send('pong')
})

module.exports = Routes
