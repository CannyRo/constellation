import { prisma } from '../config/db'
import mongoose from 'mongoose'

// Clean the DB after each test
afterEach(async () => {
  await prisma.pledge.deleteMany()
  await prisma.user.deleteMany()
})

// Disconnect after each test
afterAll(async () => {
  await prisma.$disconnect()
  await mongoose.disconnect()
})