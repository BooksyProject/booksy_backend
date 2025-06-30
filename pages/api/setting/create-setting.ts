import { NextApiRequest, NextApiResponse } from "next";
import corsMiddleware from "@/middleware/auth-middleware";
import { createSetting } from "@/lib/actions/setting.action";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res, async () => {
    if (req.method === "POST") {
      try {
        const { userId, fontSize, fontFamily, Theme, lineSpacing } = req.body;

        if (!userId || !fontSize || !fontFamily || !Theme || !lineSpacing) {
          return res.status(400).json({ message: "Missing required fields" });
        }

        const setting = await createSetting({
          userId,
          fontSize,
          fontFamily,
          Theme,
          lineSpacing,
        });

        return res
          .status(201)
          .json({ message: "Setting created successfully", setting });
      } catch (error: any) {
        if (error.code === 11000) {
          return res.status(400).json({ message: "Setting already exists" });
        }

        return res
          .status(500)
          .json({ message: "Server error", error: error.message });
      }
    } else {
      return res.status(405).json({ message: "Method Not Allowed" });
    }
  });
}
