// ✅ BẮT BUỘC đặt dòng này đầu tiên
import dotenv from "dotenv";
dotenv.config();

import { connectToDatabase } from "../lib/mongoose";
import Chapter from "../database/chapter.model";
import { extractChaptersFromEPUB } from "../utils/epubToChapters";

async function run() {
  console.log("✅ MONGODB_URL =", process.env.MONGODB_URL); // kiểm tra xem đã load chưa

  await connectToDatabase();

  const bookId = "681e0db975db5dcb5e68ac6a";
  const epubFilePath = "public/book/hemingway-in-our-time.epub";

  const chapters = await extractChaptersFromEPUB(epubFilePath);

  for (const chapter of chapters) {
    await Chapter.create({
      bookId,
      ...chapter,
    });
  }

  console.log("✅ EPUB chapters saved.");
}

run();
