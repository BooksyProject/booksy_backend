import { connectToDatabase } from "../mongoose";
import { CreateSettingDTO, SettingResponseDTO } from "@/dtos/SettingDTO";
import Setting from "@/database/setting.model";

export async function createSetting(params: CreateSettingDTO) {
  await connectToDatabase();
  const setting = await Setting.create(params);
  return setting;
}

export async function updateSetting(
  userId: string,
  updatedFields: Partial<{
    fontSize: string;
    fontFamily: string;
    Theme: string;
    lineSpacing: string;
  }>
): Promise<SettingResponseDTO | null> {
  try {
    await connectToDatabase();

    const updatedSetting = await Setting.findOneAndUpdate(
      { userId },
      { $set: updatedFields },
      { new: true }
    );

    return updatedSetting as SettingResponseDTO;
  } catch (error) {
    console.error("Error updating setting:", error);
    throw new Error("Error updating setting: " + error);
  }
}
