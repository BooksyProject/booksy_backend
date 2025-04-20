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

export interface UserLoginDTO {
  phoneNumber: string;
  password: string;
}
