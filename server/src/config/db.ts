import 'dotenv/config'
import { PrismaClient } from '../generated/prisma'
import { PrismaNeon } from '@prisma/adapter-neon'
import mongoose from 'mongoose'

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
})

export const prisma = new PrismaClient({ adapter })

export const connectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string)
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}