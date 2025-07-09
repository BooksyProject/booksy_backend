import type { NextApiRequest, NextApiResponse } from "next";
import corsMiddleware from "@/middleware/auth-middleware";
import { getCommentsByChapterId } from "@/lib/actions/comment.action";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res, async () => {
    if (req.method === "GET") {
      try {
        const { chapterId } = req.query;
        if (typeof chapterId !== "string") {
          return res.status(400).json({ message: "Invalid chapterId" });
        }

        const comments = await getCommentsByChapterId(chapterId);
        return res.status(200).json(comments);
      } catch (error) {
        console.error("❌ Error fetching comments:", error);
        return res.status(500).json({ message: "Failed to load comments" });
      }
    } else {
      return res.status(405).json({ message: "Method Not Allowed" });
    }
  });
}
