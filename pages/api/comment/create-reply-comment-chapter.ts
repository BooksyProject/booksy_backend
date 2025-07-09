import { CreateCommentDTO, CommentResponseDTO } from "@/dtos/CommentDTO";
import type { NextApiRequest, NextApiResponse } from "next";
import corsMiddleware, {
  authenticateToken,
} from "@/middleware/auth-middleware";
import { createReplyCommentChapter } from "@/lib/actions/comment.action";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  corsMiddleware(req, res, async () => {
    authenticateToken(req, res, async () => {
      if (req.method === "POST") {
        try {
          const { chapterId } = req.query;
          if (typeof chapterId !== "string") {
            return res.status(400).json({ message: "Invalid chapterId" });
          }
          const params: CreateCommentDTO = req.body;

          const newComment: CommentResponseDTO =
            await createReplyCommentChapter(params, req.user?.id, chapterId);

          return res.status(201).json(newComment);
        } catch (error) {
          console.error(error);

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
