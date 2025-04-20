import { Schema, models, model, Document } from "mongoose";
import { IAudit, AuditSchema } from "./audit.model";

export interface IUser extends Document, IAudit {
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber: string;
  email: string;
  password: string;
  avatar: string;
  gender: boolean;
  likedBookIds: Schema.Types.ObjectId[];
}

const UserSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: false },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, required: false },
  gender: { type: Boolean, required: false },
  likedBookIds: [{ type: Schema.Types.ObjectId, ref: "Book" }],
});

UserSchema.add(AuditSchema);

const User = models.User || model("User", UserSchema);

export default User;
