import { UserRegisterDTO, UserResponseDTO } from "@/dtos/UserDTO";
import mongoose, { Schema } from "mongoose";
import { connectToDatabase } from "../mongoose";
import User from "@/database/user.model";
import bcrypt from "bcryptjs";
const saltRounds = 10;

export async function createUser(
  params: UserRegisterDTO,
  createBy?: Schema.Types.ObjectId
): Promise<UserResponseDTO> {
  try {
    await connectToDatabase();

    const existedUser = await User.findOne({
      $or: [
        { email: params.email, flag: true },
        { phoneNumber: params.phoneNumber, flag: true },
      ],
    });

    if (existedUser) {
      throw new Error("User already exists!");
    }

    if (params.password !== params.rePassword) {
      throw new Error("Re-password does not match!");
    }

    const hashedPassword = await bcrypt.hash(params.password, saltRounds);

    const { password, rePassword, ...rest } = params;

    const userData = {
      ...rest,
      password: hashedPassword,
      createBy: createBy ?? new mongoose.Types.ObjectId(), // dùng AuditSchema
    };

    const newUser = await User.create(userData);

    const result: UserResponseDTO = {
      _id: newUser._id.toString(),
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      username: newUser.username,
      phoneNumber: newUser.phoneNumber,
      email: newUser.email,
      avatar: newUser.avatar,
      gender: newUser.gender,
      likedBookIds: [],
    };

    return result;
  } catch (error: any) {
    console.error("Error creating user:", error);
    throw new Error(error.message || "Internal Server Error");
  }
}
