// import type { NextApiRequest, NextApiResponse } from "next";
// import {
//   saveReadingProgress,
//   getReadingProgress,
// } from "@/lib/actions/readingProgress.action";
// import { connectToDatabase } from "@/lib/mongoose";

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   const { bookId } = req.query;

//   if (!bookId || typeof bookId !== "string") {
//     return res.status(400).json({ error: "Missing bookId" });
//   }

//   await connectToDatabase();

//   if (req.method === "GET") {
//     try {
//       const progress = await getReadingProgress(bookId);
//       if (!progress)
//         return res.status(404).json({ error: "No progress found" });

//       return res.status(200).json(progress);
//     } catch (err) {
//       console.error("❌ Failed to get reading progress:", err);
//       return res.status(500).json({ error: "Server error" });
//     }
//   }

//   if (req.method === "POST") {
//     const { chapterId, chapterNumber, percentage } = req.body;

//     if (!chapterId || chapterNumber == null) {
//       return res.status(400).json({ error: "Missing parameters" });
//     }

//     try {
//       const userId = "6629aabbcc11223344556677"; // giả lập nếu chưa có auth
//       const progress = await saveReadingProgress({
//         userId,
//         bookId,
//         chapterId,
//         chapterNumber: Number(chapterNumber),
//         percentage,
//       });

//       return res.status(200).json({
//         message: "Progress saved",
//         progress,
//       });
//     } catch (err) {
//       console.error("❌ Failed to save reading progress:", err);
//       return res.status(500).json({ error: "Failed to save progress" });
//     }
//   }

//   // Method not allowed
//   return res.status(405).end();
// }
import type { NextApiRequest, NextApiResponse } from "next";
import {
  saveReadingProgress,
  getReadingProgress,
} from "@/lib/actions/readingProgress.action";
import { connectToDatabase } from "@/lib/mongoose";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { bookId, userId } = req.query;

  if (!bookId || typeof bookId !== "string") {
    return res.status(400).json({ error: "Missing bookId" });
  }

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "Missing userId" });
  }

  await connectToDatabase();

  if (req.method === "GET") {
    try {
      const progress = await getReadingProgress(bookId, userId);
      if (!progress)
        return res.status(404).json({ error: "No progress found" });

      return res.status(200).json(progress);
    } catch (err) {
      console.error("❌ Failed to get reading progress:", err);
      return res.status(500).json({ error: "Server error" });
    }
  }

  if (req.method === "POST") {
    const { chapterId, chapterNumber, percentage } = req.body;

    if (!chapterId || chapterNumber == null) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    try {
      const progress = await saveReadingProgress({
        userId,
        bookId,
        chapterId,
        chapterNumber: Number(chapterNumber),
        percentage,
      });

      return res.status(200).json({
        message: "Progress saved",
        progress,
      });
    } catch (err) {
      console.error("❌ Failed to save reading progress:", err);
      return res.status(500).json({ error: "Failed to save progress" });
    }
  }

  return res.status(405).end(); // Method not allowed
}
