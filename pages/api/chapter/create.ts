// pages/api/chapters/create.ts
import { CreateChapterDTO } from "@/dtos/ChapterDTO";
import type { NextApiRequest, NextApiResponse } from "next";
import corsMiddleware, {
  authenticateToken,
} from "@/middleware/auth-middleware";
import { createChapter } from "@/lib/actions/chapter.action";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  corsMiddleware(req, res, async () => {
    authenticateToken(req, res, async () => {
      if (req.method === "POST") {
        try {
          const params: CreateChapterDTO = req.body;

          if (!params.bookId || !params.chapterTitle || !params.content) {
            return res
              .status(400)
              .json({ message: "Missing required chapter data" });
          }

          const result = await createChapter(params, req.user?.id);

          if (!result.status) {
            return res.status(400).json({ message: result.message });
          }

          return res.status(201).json(result);
        } catch (error) {
          console.error("❌ create chapter error:", error);
          if (error instanceof Error) {
            return res.status(400).json({ message: error.message });
          }
          return res
            .status(500)
            .json({ message: "An unexpected error occurred." });
        }
      } else {
        return res.status(405).json({ message: "Method Not Allowed" });
      }
    });
  });
}
