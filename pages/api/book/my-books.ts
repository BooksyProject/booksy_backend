import { NextApiRequest, NextApiResponse } from "next";
import { getMyBooks } from "@/lib/actions/book.action";
import corsMiddleware from "@/middleware/auth-middleware";
import { authenticateToken } from "@/middleware/auth-middleware";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Chạy CORS trước
  await corsMiddleware(req, res, async () => {
    // 2. Xác thực token
    authenticateToken(req, res, async () => {
      if (req.method === "GET") {
        try {
          const userId = String(req.user?.id); // Sau khi xác thực, req.user sẽ tồn tại

          if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
          }

          const books = await getMyBooks(userId);

          return res.status(200).json({ success: true, books });
        } catch (error: any) {
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
