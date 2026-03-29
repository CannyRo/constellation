import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { prisma, connectMongoDB } from './config/db'
import { errorHandler } from './middlewares/errorHandler'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Constellation API is running' })
})

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

startServer()

export default app