require("dotenv").config({ path: ".env" })
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const createServer = require("./createServer")
const db = require("./db")

const server = createServer()

//Parse cookies and make them available in subsequent calls in req.cookies
server.express.use(cookieParser())

//Decode the JWT cookie to get user id on each request
server.express.use((req, res, next) => {
  const { token } = req.cookies
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET)
    req.userId = userId
  }
  next()
})

//Populate the user object on each request
server.express.use(async (req, res, next) => {
  if (!req.userId) return next()
  const user = await db.query.user(
    {
      where: {
        id: req.userId
      }
    },
    "{ id name email permissions }"
  )
  req.user = user
  next()
})

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL
    }
  },
  options => {
    console.log(`Server is now running on http://localhost: ${options.port}`)
  }
)
