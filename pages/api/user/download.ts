// pages/api/users/[userId]/downloads.ts
import { NextApiRequest, NextApiResponse } from "next";
import { getDownloadedBooks } from "@/lib/actions/book.action";
import corsMiddleware from "@/middleware/auth-middleware";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res, async () => {
    if (req.method === "GET") {
      try {
        const { userId } = req.query;

        if (!userId) {
          return res.status(400).json({ message: "Missing userId" });
        }

        const books = await getDownloadedBooks(userId as string);
        return res.status(200).json(books);
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
