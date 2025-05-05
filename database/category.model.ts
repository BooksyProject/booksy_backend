import { Schema, model, models, Document } from "mongoose";
import { IAudit, AuditSchema } from "./audit.model";

export interface ICategory extends Document, IAudit {
  name: string;
  description: string;
  bookCount: number;
  uploadedAt: Date;
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  bookCount: { type: Number, default: 0 },
  uploadedAt: { type: Date, default: Date.now },
});

CategorySchema.add(AuditSchema);

const Category = models.Category || model("Category", CategorySchema);
export default Category;
