import mongoose, { Schema, Document } from 'mongoose'

export interface INotification extends Document {
  userId: string
  message: string
  read: boolean
  createdAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    userId:  { type: String, required: true, index: true },
    message: { type: String, required: true },
    read:    { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema)