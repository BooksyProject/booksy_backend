// pages/api/downloads/[downloadId]/progress.ts
import { NextApiRequest, NextApiResponse } from "next";
import { updateDownloadProgress } from "@/lib/actions/book.action";
import corsMiddleware from "@/middleware/auth-middleware";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res, async () => {
    if (req.method === "PUT") {
      try {
        const { downloadId } = req.query;
        const { progress, status, downloadSize } = req.body;

        if (!downloadId) {
          return res.status(400).json({ message: "Missing downloadId" });
        }

        const updatedDownload = await updateDownloadProgress(
          downloadId as string,
          progress,
          status,
          downloadSize
        );

        return res.status(200).json(updatedDownload);
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
