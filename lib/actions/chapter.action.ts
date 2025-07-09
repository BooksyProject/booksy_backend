import Book from "@/database/book.model";
import { connectToDatabase } from "../mongoose";
import Chapter from "@/database/chapter.model";
import { CreateChapterDTO } from "@/dtos/ChapterDTO";
import mongoose, { Schema } from "mongoose";

export async function getChaptersByBook(bookId: string) {
  await connectToDatabase();
  const chapters = await Chapter.find({ bookId }).sort({ chapterNumber: 1 });
  return chapters.map((c) => ({
    _id: c._id.toString(),
    chapterNumber: c.chapterNumber,
    chapterTitle: c.chapterTitle,
    content: c.content,
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

export async function createChapter(
  input: CreateChapterDTO,
  createBy?: Schema.Types.ObjectId
) {
  try {
    await connectToDatabase();

    let chapterNumber = input.chapterNumber;

    if (!chapterNumber) {
      const lastChapter = await Chapter.find({ bookId: input.bookId })
        .sort({ chapterNumber: -1 })
        .limit(1);
      chapterNumber =
        lastChapter.length > 0 ? lastChapter[0].chapterNumber + 1 : 1;
    }

    const newChapter = await Chapter.create({
      bookId: new mongoose.Types.ObjectId(input.bookId),
      chapterTitle: input.chapterTitle,
      content: input.content,
      chapterNumber,
      uploadedAt: new Date(),
      comments: [],
      createBy: createBy || new mongoose.Types.ObjectId(),
    });

    return {
      status: true,
      _id: newChapter._id.toString(),
      bookId: newChapter.bookId.toString(),
      chapterTitle: newChapter.chapterTitle,
      content: newChapter.content,
      chapterNumber: newChapter.chapterNumber,
      uploadedAt: newChapter.uploadedAt,
      comments: [],
    };
  } catch (error) {
    console.error("❌ Error creating chapter:", error);
    return {
      status: false,
      message: "Failed to create chapter",
    };
  }
}

export async function updateChapter(
  chapterId: string,
  updateData: Partial<CreateChapterDTO>,
  userId: string
) {
  try {
    await connectToDatabase();

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) throw new Error(`Chapter with ID ${chapterId} not found`);

    // ✅ Check quyền cập nhật
    // if (chapter.createBy?.toString() !== userId) {
    //   throw new Error("You do not have permission to update this chapter.");
    // }

    // ✅ Cập nhật các trường nếu có
    chapter.chapterTitle = updateData.chapterTitle || chapter.chapterTitle;
    chapter.content = updateData.content || chapter.content;
    chapter.chapterNumber = updateData.chapterNumber || chapter.chapterNumber;

    const updatedChapter = await chapter.save();
    return {
      status: true,
      chapter: {
        _id: updatedChapter._id.toString(),
        bookId: updatedChapter.bookId.toString(),
        chapterTitle: updatedChapter.chapterTitle,
        content: updatedChapter.content,
        chapterNumber: updatedChapter.chapterNumber,
        uploadedAt: updatedChapter.uploadedAt,
      },
    };
  } catch (error) {
    console.error("❌ Error updating chapter:", error);
    throw new Error("Unable to update chapter");
  }
}

export async function deleteChapter(chapterId: string, userId: string) {
  try {
    await connectToDatabase();

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) throw new Error("Chapter not found");

    // ✅ Kiểm tra quyền
    // if (chapter.createBy?.toString() !== userId) {
    //   throw new Error("You do not have permission to delete this chapter.");
    // }

    await Chapter.findByIdAndDelete(chapterId);
    return {
      success: true,
      message: "Chapter deleted successfully",
    };
  } catch (error) {
    console.error("❌ Error deleting chapter:", error);
    throw new Error("Unable to delete chapter");
  }
}
