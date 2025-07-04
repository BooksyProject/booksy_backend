// pages/api/reading-progress/sync.ts
import { NextApiRequest, NextApiResponse } from "next";
import ReadingProgress from "@/database/readingProgress.model";
import corsMiddleware from "@/middleware/auth-middleware";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res, async () => {
    if (req.method === "POST") {
      try {
        const {
          userId,
          bookId,
          chapterId,
          chapterNumber,
          currentPosition,
          totalProgress,
          readingTime,
        } = req.body;

        if (!userId || !bookId || !chapterId) {
          return res.status(400).json({ message: "Missing required fields" });
        }

        let progress = await ReadingProgress.findOne({ userId, bookId });

        if (!progress) {
          progress = new ReadingProgress({
            userId,
            bookId,
            chapterId,
            chapterNumber,
            currentChapter: chapterNumber,
            currentPosition,
            totalProgress: totalProgress || 0,
            readingTime: readingTime || 0,
            isCompleted: false,
            bookmarks: [],
            notes: [],
          });
        } else {
          progress.chapterId = chapterId;
          progress.chapterNumber = chapterNumber;
          progress.currentChapter = chapterNumber;
          progress.currentPosition = currentPosition;
          progress.totalProgress = totalProgress || progress.totalProgress;
          progress.readingTime =
            (progress.readingTime || 0) + (readingTime || 0);
          progress.lastReadAt = new Date();

          if (totalProgress >= 100) {
            progress.isCompleted = true;
          }
        }

        await progress.save();

        return res.status(200).json(progress);
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
