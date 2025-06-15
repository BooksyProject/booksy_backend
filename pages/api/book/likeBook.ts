import { NextApiRequest, NextApiResponse } from "next";
import { likeBook } from "@/lib/actions/book.action"; // The likeBook function from your service layer

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { bookId, userId } = req.body;

    // Validate if required fields are present
    if (!bookId || !userId) {
      return res
        .status(400)
        .json({ message: "Missing required fields: bookId and userId" });
    }

    try {
      // Call the likeBook function to increment the like count and update the book
      const result = await likeBook(bookId, userId);

      // Return the updated book details
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error liking book:", error);
      return res
        .status(500)
        .json({ message: "Failed to like the book", error: error });
    }
  } else {
    // Handle other HTTP methods
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
