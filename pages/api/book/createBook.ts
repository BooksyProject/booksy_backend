import book from "@/database/book.model";
import { createBook } from "@/lib/actions/book.action";
import corsMiddleware from "@/middleware/auth-middleware";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res, async () => {
    if (req.method === "POST") {
      try {
        const {
          title,
          author,
          categories,
          description,
          coverImage,
          fileURL,
          fileType,
        } = req.body;

        if (
          !title ||
          !author ||
          !categories ||
          !description ||
          !coverImage ||
          !fileURL ||
          !fileType
        ) {
          return res.status(400).json({ message: "Missing required fields" });
        }

        const book = await createBook({
          title,
          author,
          categories,
          description,
          coverImage,
          fileURL,
          fileType,
        });

        return res
          .status(201)
          .json({ message: "Book created successfully", book });
      } catch (error: any) {
        if (error.code === 11000) {
          return res.status(400).json({ message: "Book already exists" });
        }
        return res
          .status(500)
          .json({ message: "Server error", error: error.message });
      }
    } else {
      return res.status(405).json({ message: "Method Not Allowed" });
    }
  });
}
