// pages/api/books/[bookId]/prepare-offline.ts
import { NextApiRequest, NextApiResponse } from "next";
import { prepareOfflineReading } from "@/lib/actions/book.action";
import corsMiddleware from "@/middleware/auth-middleware";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res, async () => {
    if (req.method === "POST") {
      try {
        const { bookId, userId } = req.body;
        if (!bookId || !userId) {
          return res.status(400).json({ message: "Missing bookId or userId" });
        }

        const result = await prepareOfflineReading(
          bookId as string,
          userId as string
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
