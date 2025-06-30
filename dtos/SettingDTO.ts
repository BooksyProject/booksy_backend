export interface CreateSettingDTO {
  userId: string;
  fontSize: boolean;
  fontFamily: string;
  Theme: boolean;
  lineSpacing: number;
}

export interface SettingResponseDTO {
  _id: string;
  userId: string;
  fontSize: boolean;
  fontFamily: string;
  Theme: boolean;
  lineSpacing: number;
}
