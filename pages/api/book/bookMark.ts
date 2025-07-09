import { NextApiRequest, NextApiResponse } from "next";

import corsMiddleware from "@/middleware/auth-middleware";
import {
  addBookmark,
  getBookmarks,
  removeBookmark,
} from "@/lib/actions/book.action";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res, async () => {
    const { bookId, userId } = req.query;

    switch (req.method) {
      case "POST":
        try {
          const { chapterId, position, note, index } = req.body;

          const result = await addBookmark(
            userId as string,
            bookId as string,
            chapterId,
            position,
            note,
            index
          );

          if (!result.success) {
            return res.status(400).json({ message: result.message });
          }

          return res.status(201).json(result.data);
        } catch (error) {
          console.error("Error adding bookmark:", error);
          return res.status(500).json({ message: "Internal server error" });
        }

      case "GET":
        try {
          const result = await getBookmarks(userId as string, bookId as string);
          if (!result.success) {
            return res.status(400).json({ message: result.message });
          }
          return res.status(200).json(result.data);
        } catch (error) {
          console.error("Error fetching bookmarks:", error);
          return res.status(500).json({ message: "Internal server error" });
        }

      case "DELETE":
        try {
          const { chapterId, position } = req.body;
          const result = await removeBookmark(
            userId as string,
            bookId as string,
            chapterId,
            position
          );

          if (!result.success) {
            return res.status(400).json({ message: result.message });
          }

          console.log("xoa thanh cong");

          return res.status(200).json(result.data);
        } catch (error) {
          console.error("Error removing bookmark:", error);
          return res.status(500).json({ message: "Internal server error" });
        }

      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  });
}
