import { Schema } from "mongoose";

export interface UserRegisterDTO {
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber: string;
  email: string;
  password: string;
  rePassword: string;
  gender: boolean;
}

export interface UserResponseDTO {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber: string;
  avatar: string;
  email: string;
  gender: boolean;
  likedBookIds: Schema.Types.ObjectId[];
}

export interface UserLoginDTO {
  phoneNumber: string;
  password: string;
}

export interface UserBasicInfo {
  _id: string;
  firstName: string;
  lastName: string;
  avatar: string;
}
