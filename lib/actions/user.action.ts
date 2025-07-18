import { UserRegisterDTO, UserResponseDTO } from "@/dtos/UserDTO";
import mongoose, { Schema } from "mongoose";
import { connectToDatabase } from "../mongoose";
import User from "@/database/user.model";
import bcrypt from "bcryptjs";
import { createSetting } from "./setting.action";
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

    await createSetting({
      userId: newUser._id.toString(),
      fontSize: false,
      fontFamily: "Arial",
      Theme: true,
      lineSpacing: 1.5,
    });

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

export async function getMyProfile(id: String | undefined) {
  try {
    connectToDatabase();
    const myProfile = await User.findById(id);
    if (!myProfile) {
      console.log(`Cannot get ${id} profile now`);
      throw new Error(`Cannot get ${id} profile now`);
    }
    const result: UserResponseDTO = {
      _id: myProfile._id.toString(),
      firstName: myProfile.firstName,
      lastName: myProfile.lastName,
      username: myProfile.username,
      phoneNumber: myProfile.phoneNumber,
      email: myProfile.email,
      avatar: myProfile.avatar,
      gender: myProfile.gender,
      likedBookIds: [],
    };

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
