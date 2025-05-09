import { Schema, model, models, Document } from "mongoose";
import { IAudit, AuditSchema } from "./audit.model";

export interface ICategory extends Document {
  name: string;
  description: string;
  uploadedAt: Date;
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, required: true, trim: true },
  uploadedAt: { type: Date, required: true, default: Date.now },
});

const Category = models.Category || model("Category", CategorySchema);
export default Category;
