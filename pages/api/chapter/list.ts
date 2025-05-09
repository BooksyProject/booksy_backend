import type { NextApiRequest, NextApiResponse } from "next";
import { getChaptersByBook } from "@/lib/actions/chapter.action";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") return res.status(405).end();

  const { bookId } = req.query;
  if (!bookId || typeof bookId !== "string")
    return res.status(400).json({ error: "Missing bookId" });

  try {
    const chapters = await getChaptersByBook(bookId);
    return res.status(200).json(chapters);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch chapters" });
  }
}
