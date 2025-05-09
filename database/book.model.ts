import { Schema, model, models, Document } from "mongoose";
import { IAudit, AuditSchema } from "./audit.model";

export interface IBook extends Document, IAudit {
  title: string;
  author: string;
  categories: Schema.Types.ObjectId[];
  description: string;
  coverImage: string;
  fileURL: string;
  fileType: "EPUB" | "PDF";
  views: number;
  likes: number;
  uploadedAt: Date;
}

const BookSchema = new Schema<IBook>({
  title: { type: String, required: true },
  author: { type: String, required: true },
  categories: [
    { type: Schema.Types.ObjectId, ref: "Category", required: true },
  ],
  description: { type: String, required: true },
  coverImage: { type: String, required: true },
  fileURL: { type: String, required: true },
  fileType: { type: String, enum: ["EPUB", "PDF"], required: true },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  uploadedAt: { type: Date, default: Date.now },
});

const Book = models.Book || model("Book", BookSchema);
export default Book;
