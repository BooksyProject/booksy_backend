import { Schema, model, models, Document } from "mongoose";
import { IAudit, AuditSchema } from "./audit.model";

export interface IChapter extends Document, IAudit {
  bookId: Schema.Types.ObjectId;
  chapterNumber: number;
  chapterTitle: string;
  content: string;
  uploadedAt: Date;
}

const ChapterSchema = new Schema<IChapter>({
  bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
  chapterNumber: { type: Number, required: true },
  chapterTitle: { type: String, required: true },
  content: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

ChapterSchema.add(AuditSchema);

const Chapter = models.Chapter || model("Chapter", ChapterSchema);
export default Chapter;
