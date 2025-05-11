import { Schema, model, models, Document } from "mongoose";
import { IAudit, AuditSchema } from "./audit.model";

export interface ISetting extends Document, IAudit {
  userId: Schema.Types.ObjectId;
  fontSize: number;
  fontFamily: string;
  Theme: boolean;
  lineSpacing: number;
}

const SettingSchema = new Schema<ISetting>({
  userId: { type: Schema.Types.ObjectId, required: true },
  fontSize: { type: Number, required: true },
  fontFamily: { type: String, required: true },
  Theme: { type: Boolean, required: true },
  lineSpacing: { type: Number, required: true },
});

const Setting = models.Setting || model("Setting", SettingSchema);
export default Setting;
