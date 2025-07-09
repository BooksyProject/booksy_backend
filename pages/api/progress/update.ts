// pages/api/book/progress/update.ts
import { NextApiRequest, NextApiResponse } from "next";
import { updateReadingPosition } from "@/lib/actions/readingProgress.action";
import corsMiddleware from "@/middleware/auth-middleware";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    try {
      const { bookId, chapterId, position, userId } = req.body;

      if (!bookId || !chapterId || position === undefined) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const result = await updateReadingPosition(
        bookId,
        chapterId,
        position,
        userId
      );

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(200).json(result.data);
    } catch (error) {
      console.error("Error in API handler:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
}
