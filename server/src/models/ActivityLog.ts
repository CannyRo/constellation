import mongoose, { Schema, Document } from 'mongoose'

// Interface TypeScript — définit la forme du document
export interface IActivityLog extends Document {
  userId: string
  action: string        // ex: 'pledge_made', 'profile_updated', 'level_up'
  metadata: Record<string, unknown>  // Objet flexible selon l'action
  createdAt: Date
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: { type: String, required: true, index: true }, // index: true = recherches plus rapides par userId
    action: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },   // Mixed = n'importe quelle structure
  },
  { timestamps: { createdAt: true, updatedAt: false } }    // Ajoute createdAt automatiquement
)

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema)