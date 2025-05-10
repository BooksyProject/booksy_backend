// models/readingProgress.model.ts
import { Schema, model, models, Document } from "mongoose";

export interface IReadingProgress extends Document {
  userId: Schema.Types.ObjectId;
  bookId: Schema.Types.ObjectId;
  chapterId: Schema.Types.ObjectId;
  chapterNumber: number;
  lastReadAt: Date;
  percentage?: number; // optional: phần trăm đọc nếu muốn track theo % cho EPUB/PDF
}

const ReadingProgressSchema = new Schema<IReadingProgress>({
  userId: { type: Schema.Types.ObjectId, required: true },
  bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
  chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", required: true },
  chapterNumber: { type: Number, required: true },
  lastReadAt: { type: Date, default: Date.now },
  percentage: { type: Number, min: 0, max: 100 },
});

const ReadingProgress =
  models.ReadingProgress || model("ReadingProgress", ReadingProgressSchema);

export default ReadingProgress;
