import { NextApiRequest, NextApiResponse } from "next";
import { getLikedBooks } from "@/lib/actions/book.action"; // Giả sử bạn có hàm getLikedBooks trong service layer

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { userId } = req.query; // Lấy userId từ query

    // Kiểm tra nếu userId không có
    if (!userId) {
      return res
        .status(400)
        .json({ message: "Missing required field: userId" });
    }

    try {
      // Gọi hàm getLikedBooks để lấy danh sách sách yêu thích của người dùng
      const result = await getLikedBooks(userId as string);

      // Trả về danh sách sách yêu thích
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching liked books:", error);
      return res
        .status(500)
        .json({ message: "Failed to fetch liked books", error: error });
    }
  } else {
    // Nếu không phải GET, trả về lỗi Method Not Allowed
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
