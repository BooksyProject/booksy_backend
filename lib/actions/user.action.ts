import { UserRegisterDTO, UserResponseDTO } from "@/dtos/UserDTO";
import mongoose, { Schema } from "mongoose";
import { connectToDatabase } from "../mongoose";
import User from "@/database/user.model";
import bcrypt from "bcryptjs";
const saltRounds = 10;

export async function createUser(
  params: UserRegisterDTO,
  createBy: Schema.Types.ObjectId | undefined
) {
  try {
    connectToDatabase();

    const existedUser = await User.findOne({
      $or: [
        { email: params.email, flag: true },
        { phoneNumber: params.phoneNumber, flag: true },
      ],
    });

    if (params.password !== params.rePassword) {
      throw new Error("Your re-password is wrong!");
    }

    if (existedUser) {
      throw new Error("User is already exist!");
    }

    const hashPassword = await bcrypt.hash(params.password, saltRounds);

    const { rePassword, password, ...userData } = params;

    const createUserData = Object.assign({}, userData, {
      password: hashPassword,
      attendDate: new Date(),
      roles: ["user"],
      createBy: createBy ? createBy : new mongoose.Types.ObjectId(),
      status: false,
    });

    const newUser = await User.create(createUserData);
    const result: UserResponseDTO = {
      _id: newUser._id.toString(),
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      username: newUser.nickName,
      phoneNumber: newUser.phoneNumber,
      email: newUser.email,
      avatar: newUser.avatar,
      gender: newUser.gender,
      likedBookIds: [],
    };

    return result;
  } catch (error) {
    console.log(error);
  }
}
