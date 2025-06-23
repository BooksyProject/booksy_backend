import { getAllBooks } from "@/lib/actions/book.action";
import corsMiddleware from "@/middleware/auth-middleware";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res, async () => {
    if (req.method === "GET") {
      try {
        const books = await getAllBooks();

        return res
          .status(200)
          .json({ message: "Got all books successfully", books });
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
