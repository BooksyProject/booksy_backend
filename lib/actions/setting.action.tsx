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
    fontSize: boolean; // ✅ boolean
    fontFamily: string;
    Theme: boolean;
    lineSpacing: number; // ✅ number
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

export async function getSettingByUserId(
  userId: string
): Promise<SettingResponseDTO | null> {
  try {
    await connectToDatabase();

    const setting = await Setting.findOne({ userId });

    if (!setting) return null;

    const result: SettingResponseDTO = {
      _id: setting._id?.toString() || "",
      userId: setting.userId?.toString() || "",
      fontSize: setting.fontSize, // boolean
      fontFamily: setting.fontFamily,
      Theme: setting.Theme,
      lineSpacing: setting.lineSpacing, // number
    };

    return result;
  } catch (error) {
    console.error("Error getting setting:", error);
    throw new Error("Failed to get setting");
  }
}
