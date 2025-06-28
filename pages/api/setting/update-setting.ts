// pages/api/setting/update.ts
import { NextApiRequest, NextApiResponse } from "next";
import corsMiddleware from "@/middleware/auth-middleware";
import { updateSetting } from "@/lib/actions/setting.action";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res, async () => {
    if (req.method === "PUT") {
      try {
        const { userId, fontSize, fontFamily, Theme, lineSpacing } = req.body;

        if (!userId) {
          return res.status(400).json({ message: "Missing userId" });
        }

        const updatedFields: Record<string, any> = {};

        if (fontSize) updatedFields.fontSize = fontSize;
        if (fontFamily) updatedFields.fontFamily = fontFamily;
        if (Theme) updatedFields.Theme = Theme;
        if (lineSpacing) updatedFields.lineSpacing = lineSpacing;

        if (Object.keys(updatedFields).length === 0) {
          return res.status(400).json({ message: "No fields to update" });
        }

        const setting = await updateSetting(userId, updatedFields);

        if (!setting) {
          return res.status(404).json({ message: "Setting not found" });
        }

        return res
          .status(200)
          .json({ message: "Setting updated successfully", setting });
      } catch (error: any) {
        return res
          .status(500)
          .json({ message: "Server error", error: error.message });
      }
    } else {
      return res.status(405).json({ message: "Method Not Allowed" });
    }
  });
}
