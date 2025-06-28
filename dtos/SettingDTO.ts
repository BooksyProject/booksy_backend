export interface CreateSettingDTO {
  userId: string;
  fontSize: number;
  fontFamily: string;
  Theme: string;
  lineSpacing: number;
}

export interface SettingResponseDTO {
  _id: string;
  userId: string;
  fontSize: number;
  fontFamily: string;
  Theme: string;
  lineSpacing: number;
}
