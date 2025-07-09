// models/readingProgress.model.ts
import { Schema, model, models, Document } from "mongoose";

export interface IReadingProgress extends Document {
  userId: Schema.Types.ObjectId;
  bookId: Schema.Types.ObjectId;
  chapterId: Schema.Types.ObjectId;
  chapterNumber: number;
  lastReadAt: Date;
  percentage?: number; // optional: phần trăm đọc nếu muốn track theo % cho EPUB/PDF
  currentChapter: number;
  currentPosition: number; // Vị trí trong chương (%)
  totalProgress: number; // Tổng tiến độ sách (%)
  readingTime: number; // Tổng thời gian đọc (phút)
  isCompleted: boolean;
  bookmarks: Array<{
    chapterId: Schema.Types.ObjectId;
    position: number;
    note?: string;
    index?: { type: Number };

    createdAt: Date;
  }>;
  notes: Array<{
    chapterId: Schema.Types.ObjectId;
    position: number;
    content: string;
    createdAt: Date;
  }>;
}

const ReadingProgressSchema = new Schema<IReadingProgress>({
  userId: { type: Schema.Types.ObjectId, required: true },
  bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
  chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", required: true },
  chapterNumber: { type: Number, required: true },
  lastReadAt: { type: Date, default: Date.now },
  percentage: { type: Number, min: 0, max: 100 },
  currentChapter: { type: Number, default: 1 },
  currentPosition: { type: Number, default: 0, min: 0, max: 100 },
  totalProgress: { type: Number, default: 0, min: 0, max: 100 },
  readingTime: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  bookmarks: [
    {
      chapterId: { type: Schema.Types.ObjectId, ref: "Chapter" },
      position: { type: Number },
      note: { type: String },
      index: { type: Number },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  notes: [
    {
      chapterId: { type: Schema.Types.ObjectId, ref: "Chapter" },
      position: { type: Number },
      content: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

// Index để query nhanh
ReadingProgressSchema.index({ userId: 1, bookId: 1 }, { unique: true });
ReadingProgressSchema.index({ userId: 1, lastReadAt: -1 });
ReadingProgressSchema.index({ userId: 1, isCompleted: 1 });

const ReadingProgress =
  models.ReadingProgress || model("ReadingProgress", ReadingProgressSchema);

export default ReadingProgress;
