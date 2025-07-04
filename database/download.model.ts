import { Schema, model, models, Document } from "mongoose";
import { IAudit, AuditSchema } from "./audit.model";

// Model để track downloads của user
export interface IUserDownload extends Document, IAudit {
  userId: Schema.Types.ObjectId;
  bookId: Schema.Types.ObjectId;
  downloadedAt: Date;
  lastAccessedAt: Date;
  downloadSize: number;
  status: "DOWNLOADING" | "COMPLETED" | "FAILED" | "DELETED";
  progress: number; // 0-100
  errorMessage?: string;
  deviceInfo?: {
    platform: string;
    version: string;
    deviceId: string;
  };
}

const UserDownloadSchema = new Schema<IUserDownload>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
  downloadedAt: { type: Date, default: Date.now },
  lastAccessedAt: { type: Date, default: Date.now },
  downloadSize: { type: Number, required: true },
  status: {
    type: String,
    enum: ["DOWNLOADING", "COMPLETED", "FAILED", "DELETED"],
    default: "DOWNLOADING",
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  errorMessage: { type: String },
  deviceInfo: {
    platform: { type: String },
    version: { type: String },
    deviceId: { type: String },
  },
});

// Index để query nhanh
UserDownloadSchema.index({ userId: 1, bookId: 1 }, { unique: true });
UserDownloadSchema.index({ userId: 1, downloadedAt: -1 });
UserDownloadSchema.index({ status: 1 });

const UserDownload =
  models.UserDownload || model("UserDownload", UserDownloadSchema);
export default UserDownload;
