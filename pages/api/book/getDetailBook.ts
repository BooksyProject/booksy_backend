import { getBookDetail } from "@/lib/actions/book.action";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") return res.status(405).end();

  const { bookId } = req.query;
  if (!bookId || typeof bookId !== "string")
    return res.status(400).json({ error: "Missing bookId" });

  try {
    const bookDetail = await getBookDetail(bookId);
    return res.status(200).json(bookDetail);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch chapters" });
  }
}
