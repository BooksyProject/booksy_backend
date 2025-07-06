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

export async function updateReadingPosition(
  bookId: string,
  chapterId: string,
  position: number,
  userId: string
) {
  try {
    await connectToDatabase();

    // Validate input
    if (!bookId || !chapterId || position === undefined || !userId) {
      throw new Error("Missing required fields");
    }

    if (position < 0 || position > 1) {
      throw new Error("Position must be between 0 and 1");
    }

    const updatedProgress = await ReadingProgress.findOneAndUpdate(
      { userId, bookId },
      {
        $set: {
          chapterId,
          currentPosition: position,
          lastReadAt: new Date(),
        },
      },
      { new: true, upsert: true }
    ).populate("chapterId");

    return {
      success: true,
      data: {
        chapterId: updatedProgress.chapterId,
        currentPosition: updatedProgress.currentPosition,
        lastReadAt: updatedProgress.lastReadAt,
      },
    };
  } catch (error) {
    console.error("Error updating reading position:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
