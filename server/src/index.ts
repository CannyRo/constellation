import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes'
import userRoutes from './routes/user.routes'
import projectRoutes from './routes/project.routes'
import { prisma, connectMongoDB } from './config/db'
import { errorHandler } from './middlewares/errorHandler'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean) as string[]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Constellation API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/projects', projectRoutes);

app.use(errorHandler) 

const startServer = async () => {
  try {
    await prisma.$connect()
    console.log('PostgreSQL connected successfully')
    await connectMongoDB()
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer()
}

export default app