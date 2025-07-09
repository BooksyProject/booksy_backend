import type { NextApiRequest, NextApiResponse } from "next";
import corsMiddleware, {
  authenticateToken,
} from "@/middleware/auth-middleware";
import { updateChapter, deleteChapter } from "@/lib/actions/chapter.action";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res, async () => {
    authenticateToken(req, res, async () => {
      const { id: chapterId } = req.query;

      if (!chapterId || typeof chapterId !== "string") {
        return res.status(400).json({ error: "Invalid chapter ID" });
      }

      const userId = String(req.user?.id);

      switch (req.method) {
        case "PATCH": {
          try {
            const updateData = req.body;
            const updated = await updateChapter(chapterId, updateData, userId);
            return res.status(200).json(updated);
          } catch (err: any) {
            return res.status(500).json({
              message: "Failed to update chapter",
              error: err.message,
            });
          }
        }

        case "DELETE": {
          try {
            const result = await deleteChapter(chapterId, userId);
            return res.status(200).json(result);
          } catch (err: any) {
            return res.status(500).json({
              message: "Failed to delete chapter",
              error: err.message,
            });
          }
        }

        default: {
          res.setHeader("Allow", ["PATCH", "DELETE"]);
          return res
            .status(405)
            .json({ message: `Method ${req.method} Not Allowed` });
        }
      }
    });
  });
}
