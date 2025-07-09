import type { NextApiRequest, NextApiResponse } from "next";
import corsMiddleware, {
  authenticateToken,
} from "@/middleware/auth-middleware";
import { updateBook, deleteBook } from "@/lib/actions/book.action";
import { CreateBookDTO } from "@/dtos/BookDTO"; // Nếu bạn có DTO riêng cho update có thể dùng Partial<CreateBookDTO>

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  corsMiddleware(req, res, async () => {
    authenticateToken(req, res, async () => {
      const { id: bookId } = req.query;

      if (!bookId || typeof bookId !== "string") {
        return res.status(400).json({ error: "Invalid book ID" });
      }

      const userId = String(req.user?.id);

      switch (req.method) {
        case "PATCH": {
          try {
            const updateData = req.body;
            const updatedBook = await updateBook(bookId, updateData, userId);

            return res.status(200).json({
              message: "Book updated successfully",
              book: updatedBook,
            });
          } catch (error: any) {
            console.error("❌ Error in PATCH /book/[id]:", error);
            return res.status(500).json({
              message: "Failed to update book",
              error: error.message || "Internal server error",
            });
          }
        }

        case "DELETE": {
          try {
            await deleteBook(bookId, userId);
            return res
              .status(200)
              .json({ message: "Book deleted successfully" });
          } catch (error: any) {
            return res.status(500).json({
              message: "Failed to delete book",
              error: error.message || "Internal server error",
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
