import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
	actor_id: string | null;
	action: string;
	entity?: string;
	entity_id?: string;
	meta?: any;
	createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
	actor_id: { type: String, default: null },
	action: { type: String, required: true },
	entity: { type: String },
	entity_id: { type: String },
	meta: { type: Schema.Types.Mixed }
}, { timestamps: { createdAt: true, updatedAt: false } });

AuditLogSchema.index({ action: 1, createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export default AuditLog;
