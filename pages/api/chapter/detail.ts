import type { NextApiRequest, NextApiResponse } from "next";
import { getChapterDetail } from "@/lib/actions/chapter.action";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") return res.status(405).end();

  const { bookId, chapterNumber } = req.query;
  if (!bookId || !chapterNumber)
    return res.status(400).json({ error: "Missing parameters" });

  try {
    const chapter = await getChapterDetail(
      bookId as string,
      Number(chapterNumber)
    );
    if (!chapter) return res.status(404).json({ error: "Chapter not found" });

    return res.status(200).json(chapter);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch chapter detail" });
  }
}
