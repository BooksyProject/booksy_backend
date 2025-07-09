import book from "@/database/book.model";
import { createBook } from "@/lib/actions/book.action";
import corsMiddleware, {
  authenticateToken,
} from "@/middleware/auth-middleware";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Bước 1: CORS
  await corsMiddleware(req, res, async () => {
    // Bước 2: Xác thực JWT
    authenticateToken(req, res, async () => {
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

          const userId = String(req.user?.id); // Lúc này đã có req.user

          if (
            !title ||
            !author ||
            !categories ||
            !description ||
            !coverImage ||
            !fileURL ||
            !fileType ||
            !userId
          ) {
            return res.status(400).json({ message: "Missing required fields" });
          }

          const newBook = await createBook({
            title,
            author,
            categories,
            description,
            coverImage,
            fileURL,
            fileType,
            createdBy: userId,
          });

          return res
            .status(201)
            .json({ message: "Book created successfully", book: newBook });
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
  });
}
