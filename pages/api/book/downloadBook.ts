// pages/api/book/downloadBook.ts
import { downloadBook } from "@/lib/actions/book.action";
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("🚀 Download API called");
  console.log("Method:", req.method);
  console.log("Query:", req.query);

  if (req.method !== "GET") {
    console.log("❌ Method not allowed");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { bookId } = req.query;
  console.log("📖 BookId received:", bookId);

  if (!bookId || typeof bookId !== "string") {
    console.log("❌ Missing or invalid bookId");
    return res.status(400).json({ error: "Missing or invalid bookId" });
  }

  try {
    console.log("🔄 Calling downloadBook action...");
    const bookData = await downloadBook(bookId);
    console.log("📚 Book data received");
    console.log("🌐 Is URL:", bookData.data.isUrl);

    if (!bookData.success) {
      console.log("❌ Book not found in database");
      return res.status(404).json({ error: "Book not found" });
    }

    const { filePath, fileName, fileType, isUrl } = bookData.data;

    if (isUrl) {
      console.log("🌐 Processing URL file:", filePath);

      try {
        console.log("📥 Fetching file from URL...");
        const response = await fetch(filePath);

        if (!response.ok) {
          console.log(
            "❌ Failed to fetch file from URL:",
            response.status,
            response.statusText
          );
          return res
            .status(404)
            .json({ error: "Could not fetch file from URL" });
        }

        const fileBuffer = Buffer.from(await response.arrayBuffer());
        console.log("📊 File size from URL:", fileBuffer.length, "bytes");

        // Set headers
        const mimeTypes = {
          pdf: "application/pdf",
          epub: "application/epub+zip",
        };

        const contentType =
          mimeTypes[fileType as keyof typeof mimeTypes] ||
          "application/octet-stream";
        console.log("🏷️ Content type:", contentType);

        res.setHeader("Content-Type", contentType);
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${encodeURIComponent(fileName)}"`
        );
        res.setHeader("Content-Length", fileBuffer.length);
        res.setHeader("Cache-Control", "no-cache");

        console.log("✅ Sending file from URL...");
        return res.status(200).send(fileBuffer);
      } catch (fetchError) {
        console.error("💥 Error fetching from URL:", fetchError);
        return res.status(500).json({ error: "Failed to fetch file from URL" });
      }
    } else {
      // Sửa phần xử lý file local
      const fileName = path.basename(filePath); // Chỉ lấy tên file
      const correctFilePath = path.join(
        process.cwd(),
        "public",
        "book",
        fileName
      );

      console.log("📁 Correct local file path:", correctFilePath);

      if (!fs.existsSync(correctFilePath)) {
        console.log("❌ File not found at:", correctFilePath);
        return res.status(404).json({ error: "File not found on server" });
      }

      console.log("✅ Reading local file...");
      const fileBuffer = fs.readFileSync(correctFilePath);
      console.log("📊 Local file size:", fileBuffer.length, "bytes");

      // Set headers
      const mimeTypes = {
        pdf: "application/pdf",
        epub: "application/epub+zip",
      };

      const contentType =
        mimeTypes[fileType.toLowerCase() as keyof typeof mimeTypes] ||
        "application/octet-stream";

      res.setHeader("Content-Type", contentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(fileName)}"`
      );
      res.setHeader("Content-Length", fileBuffer.length);
      res.setHeader("Cache-Control", "no-cache");

      console.log("✅ Sending local file...");
      return res.status(200).send(fileBuffer);
    }
  } catch (error) {
    console.error("💥 Download API error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to download book";
    return res.status(500).json({ error: errorMessage });
  }
}
