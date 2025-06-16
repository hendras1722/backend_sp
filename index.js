require('dotenv').config()

const express = require('express')
const Routes = require('./src/routes')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const path = require('path')
const { Response } = require('./src/helpers/Response')

const app = express()

app
  .use(cors())
  .use(express.json())
  .use(cookieParser())
  .use(express.static(path.join(__dirname, 'public')))
  .use(express.urlencoded({ extended: true }))
  .use('/v1', Routes)
  .get('/test', (req, res) => {
    res.send('ping')
  })
  .use((req, res, next) => {
    Response(res, false, 'Route not found', 'Oh You are lost')
  })
  .use((err, req, res, next) => {
    console.error(err)
    Response(res, false, 'Internal Server Error', 'Something wrong!')
  })

if (require.main === module) {
  const port = process.env.PORT || 3000
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
  })
}

module.exports = app
