// pages/api/users/[userId]/downloads/[bookId].ts
import { NextApiRequest, NextApiResponse } from "next";
import { deleteDownloadedBook } from "@/lib/actions/book.action";
import corsMiddleware from "@/middleware/auth-middleware";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res, async () => {
    if (req.method === "DELETE") {
      try {
        const { userId, bookId } = req.query;

        if (!userId || !bookId) {
          return res.status(400).json({ message: "Missing userId or bookId" });
        }

        const result = await deleteDownloadedBook(
          userId as string,
          bookId as string
        );

        return res.status(200).json(result);
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
