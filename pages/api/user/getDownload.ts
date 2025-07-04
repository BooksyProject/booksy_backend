// pages/api/users/[userId]/downloads/[bookId].ts (GET method)
import { NextApiRequest, NextApiResponse } from "next";
import corsMiddleware from "@/middleware/auth-middleware";
import UserDownload from "@/database/download.model";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res, async () => {
    if (req.method === "GET") {
      try {
        const { userId, bookId } = req.query;

        if (!userId || !bookId) {
          return res.status(400).json({ message: "Missing userId or bookId" });
        }

        const download = await UserDownload.findOne({
          userId,
          bookId,
          status: "COMPLETED",
        }).populate("bookId");

        if (!download) {
          return res.status(404).json({ message: "Download not found" });
        }

        return res.status(200).json(download);
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
