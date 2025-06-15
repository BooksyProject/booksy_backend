import Book from "@/database/book.model";
import { connectToDatabase } from "../mongoose";
import Chapter from "@/database/chapter.model";

export async function getChaptersByBook(bookId: string) {
  await connectToDatabase();
  const chapters = await Chapter.find({ bookId }).sort({ chapterNumber: 1 });
  return chapters.map((c) => ({
    _id: c._id.toString(),
    chapterNumber: c.chapterNumber,
    chapterTitle: c.chapterTitle,
  }));
}

export async function getChapterDetail(bookId: string, chapterNumber: number) {
  await connectToDatabase();

  // Fetch the chapter details
  const chapter = await Chapter.findOne({ bookId, chapterNumber });
  if (!chapter) return null;

  // Increment the view count for the book
  await Book.updateOne(
    { _id: bookId }, // Find the book by its ID
    { $inc: { views: 1 } } // Increment the views field by 1
  );

  return {
    _id: chapter._id.toString(),
    chapterNumber: chapter.chapterNumber,
    chapterTitle: chapter.chapterTitle,
    content: chapter.content,
  };
}
