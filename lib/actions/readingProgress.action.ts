import { connectToDatabase } from "../mongoose";
import ReadingProgress from "@/database/readingProgress.model";

export async function saveReadingProgress({
  userId,
  bookId,
  chapterId,
  chapterNumber,
  percentage,
}: {
  userId: string;
  bookId: string;
  chapterId: string;
  chapterNumber: number;
  percentage?: number;
}) {
  await connectToDatabase();

  const updated = await ReadingProgress.findOneAndUpdate(
    { userId, bookId },
    {
      chapterId,
      chapterNumber,
      percentage,
      lastReadAt: new Date(),
    },
    { new: true, upsert: true }
  );

  return {
    _id: updated._id.toString(),
    chapterId: updated.chapterId.toString(),
    chapterNumber: updated.chapterNumber,
    percentage: updated.percentage,
  };
}

interface GetReadingProgressParams {
  userId: string;
  bookId: string;
}

export async function getReadingProgress(bookId: string, userId: string) {
  await connectToDatabase();

  const resolvedUserId = userId;

  const progress = await ReadingProgress.findOne({
    bookId,
    userId: resolvedUserId,
  }).sort({ lastReadAt: -1 });

  if (!progress) return null;

  return {
    chapterId: progress.chapterId.toString(),
    chapterNumber: progress.chapterNumber,
    percentage: progress.percentage,
  };
}
