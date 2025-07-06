import mongoose from "mongoose";
import { connectToDatabase } from "../mongoose";
import book from "@/database/book.model";
import {
  BookDTO,
  BookResponseDTO,
  CreateBookDTO,
  ReadingProgressResponse,
} from "@/dtos/BookDTO";
import Book from "@/database/book.model";
import Category from "@/database/category.model";
import Chapter from "@/database/chapter.model";
import User from "@/database/user.model";
import { UserInfo } from "os";
import corsMiddleware from "@/middleware/auth-middleware";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";
import UserDownload from "@/database/download.model";
import ReadingProgress from "@/database/readingProgress.model";

export async function createBook(params: CreateBookDTO): Promise<BookDTO> {
  try {
    await connectToDatabase();

    const bookData = {
      title: params.title,
      author: params.author,
      categories: params.categories,
      description: params.description,
      coverImage: params.coverImage,
      fileURL: params.fileURL,
      fileType: params.fileType,
    };

    // Tạo báo cáo mới trong DB
    const newBook = await Book.create(bookData);

    return newBook as BookDTO;
  } catch (error) {
    console.error("Error creating book:", error);
    throw new Error("Error creating book: " + error);
  }
}

export async function getAllBooks(): Promise<BookResponseDTO[]> {
  try {
    await connectToDatabase();

    const books = await Book.find().lean();

    const formattedBooks: BookResponseDTO[] = books.map((book: any) => ({
      _id: book._id,
      title: book.title,
      author: book.author,
      categories: book.categories,
      description: book.description,
      coverImage: book.coverImage,
      fileURL: book.fileURL,
      fileType: book.fileType,
      views: book.views,
      likes: book.likes,
      uploadedAt: book.uploadedAt,
    }));

    return formattedBooks;
  } catch (error) {
    console.error("Error fetching books:", error);
    throw new Error("Error fetching books: " + error);
  }
}

export async function getBookDetail(bookId: string) {
  await connectToDatabase();
  const bookDetail = await Book.findById(bookId).populate({
    path: "categories",
    model: Category,
    select: "name _id",
  });

  if (!bookDetail) {
    throw new Error("Book not found!");
  }

  const totalChapters = await Chapter.countDocuments({ bookId });

  return {
    success: true,
    data: {
      _id: bookDetail._id,
      title: bookDetail.title,
      author: bookDetail.author,
      categories: bookDetail.categories,
      description: bookDetail.description,
      coverImage: bookDetail.coverImage,
      fileURL: bookDetail.fileURL,
      fileType: bookDetail.fileType,
      views: bookDetail.views + 1, // Return updated view count
      likes: bookDetail.likes,
      uploadedAt: bookDetail.uploadedAt,
      chapters: totalChapters,
    },
  };
}

export async function likeBook(bookId: string, userId: string) {
  await connectToDatabase();

  // Find the book by its ID and increment likes and views
  const book = await Book.findOneAndUpdate(
    { _id: bookId }, // Find the book by its ID
    {
      $inc: { likes: 1 }, // Increment both likes and views by 1
    },
    { new: true } // Ensure the updated document is returned
  );

  // If the book doesn't exist
  if (!book) {
    throw new Error("Book not found");
  }

  // Find the user and add the book to their likedBooks array if they haven't already liked it
  const user = await User.findOneAndUpdate(
    { _id: userId, likedBookIds: { $ne: bookId } }, // Check if the user hasn't already liked the book
    { $push: { likedBookIds: bookId } }, // Add the bookId to the likedBookIds array
    { new: true } // Ensure the updated user document is returned
  );

  // If the user doesn't exist or has already liked the book
  if (!user) {
    throw new Error("User not found or already liked this book");
  }

  // Return the updated book details
  return {
    _id: book._id,
    likes: book.likes,
    views: book.views,
    likedByUser: user.likedBookIds.includes(bookId), // Optional: Check if the user has liked this book
  };
}

export async function unlikeBook(bookId: string, userId: string) {
  await connectToDatabase();

  // Tìm cuốn sách và giảm lượt thích và lượt xem
  const book = await Book.findOneAndUpdate(
    { _id: bookId }, // Tìm cuốn sách theo ID
    {
      $inc: { likes: -1 }, // Giảm 1 lượt thích
    },
    { new: true } // Đảm bảo trả về cuốn sách đã được cập nhật
  );

  // Nếu cuốn sách không tồn tại
  if (!book) {
    throw new Error("Book not found");
  }

  // Tìm người dùng và xóa cuốn sách khỏi danh sách likedBookIds
  const user = await User.findOneAndUpdate(
    { _id: userId, likedBookIds: { $in: [bookId] } }, // Kiểm tra người dùng đã thích sách này chưa
    { $pull: { likedBookIds: bookId } }, // Xóa bookId khỏi likedBookIds array
    { new: true } // Đảm bảo trả về người dùng đã được cập nhật
  );

  // Nếu người dùng không tồn tại hoặc chưa thích cuốn sách
  if (!user) {
    throw new Error("User not found or book not in user's liked books");
  }

  // Trả về thông tin cuốn sách đã được cập nhật
  return {
    _id: book._id,
    likes: book.likes,
    views: book.views,
    likedByUser: user.likedBookIds.includes(bookId), // Kiểm tra xem người dùng đã thích sách này hay chưa
  };
}

export async function downloadBook(bookId: string) {
  try {
    console.log("🔌 Connecting to database...");
    await connectToDatabase();
    console.log("✅ Database connected");

    console.log("🔍 Finding book with ID:", bookId);
    const book = await Book.findById(bookId);
    console.log("📚 Book found:", book ? "Yes" : "No");

    if (!book) {
      console.log("❌ Book not found in database");
      throw new Error("Book not found!");
    }

    console.log("📖 Book details:", {
      id: book._id,
      title: book.title,
      author: book.author,
      fileURL: book.fileURL,
      fileType: book.fileType,
    });

    // ✅ KIỂM TRA XEM FILE LÀ URL HAY LOCAL PATH
    const isUrl =
      book.fileURL.startsWith("http://") || book.fileURL.startsWith("https://");
    console.log("🌐 Is URL:", isUrl);
    console.log("📂 FileURL:", book.fileURL);

    if (!isUrl) {
      // Chỉ lấy tên file từ đường dẫn (phòng trường hợp có đường dẫn tương đối)
      const fileName = path.basename(book.fileURL);
      const filePath = path.join(process.cwd(), "public", "book", fileName);

      console.log("📁 Checking local file path:", filePath);

      if (!fs.existsSync(filePath)) {
        console.log("❌ Local file not found");
        throw new Error("Book file not found on server!");
      }
      console.log("✅ Local file exists");
    }

    // Thay thế đoạn kiểm tra cũ bằng:
    const supportedFormats = ["pdf", "epub"]; // Viết thường toàn bộ
    const fileTypeLower = book.fileType.toLowerCase(); // Chuyển về chữ thường

    if (!supportedFormats.includes(fileTypeLower)) {
      console.log("❌ Unsupported file type:", book.fileType);
      throw new Error(
        `Unsupported file format. Supported formats: ${supportedFormats.join(
          ", "
        )}`
      );
    }

    console.log("✅ File type supported:", book.fileType);

    // Tăng lượt tải xuống
    try {
      await Book.findByIdAndUpdate(bookId, {
        $inc: { downloads: 1 },
      });
      console.log("✅ Download count updated");
    } catch (updateError) {
      console.log("⚠️ Could not update download count:", updateError);
    }

    const normalizeLocalPath = (filePath: string) => {
      const fileName = path.basename(filePath);
      return path.join("public", "book", fileName); // Trả về đường dẫn tương đối
    };

    const result = {
      success: true,
      data: {
        _id: book._id,
        title: book.title,
        author: book.author,
        fileURL: book.fileURL,
        fileType: book.fileType,
        fileName: `${book.title} - ${book.author}.${book.fileType}`,
        filePath: isUrl ? book.fileURL : normalizeLocalPath(book.fileURL),
        isUrl: isUrl,
      },
    };

    console.log("✅ Download book action completed successfully");
    console.log("📊 Result isUrl:", result.data.isUrl);
    return result;
  } catch (error) {
    console.error("💥 Download book action error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to prepare book download"
    );
  }
}

export const getLikedBooks = async (
  userId: string
): Promise<(BookResponseDTO & { totalChapters: number })[]> => {
  try {
    // Lấy user và populate sách đã thích
    const user = await User.findById(userId).populate("likedBookIds");

    if (!user) {
      throw new Error("User not found");
    }

    // Với mỗi sách đã thích, lấy thêm tổng số chương
    const likedBooksWithChapters = await Promise.all(
      user.likedBookIds.map(async (book: any) => {
        const totalChapters = await Chapter.countDocuments({
          bookId: book._id,
        });

        return {
          _id: book._id,
          title: book.title,
          author: book.author,
          categories: book.categories,
          description: book.description,
          coverImage: book.coverImage,
          fileURL: book.fileURL,
          fileType: book.fileType,
          views: book.views,
          likes: book.likes,
          uploadedAt: book.uploadedAt,
          totalChapters,
        };
      })
    );

    return likedBooksWithChapters;
  } catch (error) {
    console.error("❌ Error fetching liked books:", error);
    throw new Error("Unable to fetch liked books");
  }
};

// Thêm hàm mới cho chức năng offline
export async function prepareOfflineReading(bookId: string, userId: string) {
  await connectToDatabase();

  // 1. Kiểm tra sách có tồn tại không
  const book = await Book.findById(bookId);
  if (!book) {
    throw new Error("Book not found");
  }

  // 2. Kiểm tra xem user đã tải sách này chưa
  const existingDownload = await UserDownload.findOne({ userId, bookId });
  if (existingDownload && existingDownload.status === "COMPLETED") {
    return {
      status: "ALREADY_DOWNLOADED",
      book,
      downloadRecord: existingDownload,
    };
  }

  // 3. Tạo bản ghi download mới hoặc cập nhật bản ghi cũ
  let downloadRecord;
  if (existingDownload) {
    downloadRecord = await UserDownload.findByIdAndUpdate(
      existingDownload._id,
      {
        status: "DOWNLOADING",
        progress: 0,
        lastAccessedAt: new Date(),
      },
      { new: true }
    );
  } else {
    downloadRecord = await UserDownload.create({
      userId,
      bookId,
      status: "DOWNLOADING",
      progress: 0,
      downloadSize: 0, // Sẽ cập nhật sau khi tải xong
    });
  }

  // 4. Trả về thông tin để client bắt đầu tải
  return {
    status: "READY_TO_DOWNLOAD",
    book,
    downloadRecord,
  };
}

export async function updateDownloadProgress(
  downloadId: string,
  progress: number,
  status: "DOWNLOADING" | "COMPLETED" | "FAILED",
  downloadSize?: number
) {
  await connectToDatabase();

  const updateData: any = {
    progress,
    status,
    lastAccessedAt: new Date(),
  };

  if (downloadSize) {
    updateData.downloadSize = downloadSize;
  }

  if (status === "FAILED") {
    updateData.errorMessage = "Download failed";
  }

  const updatedDownload = await UserDownload.findByIdAndUpdate(
    downloadId,
    updateData,
    { new: true }
  );

  return updatedDownload;
}

export async function getDownloadedBooks(userId: string) {
  await connectToDatabase();

  const downloads = await UserDownload.find({
    userId,
    status: "COMPLETED",
  }).populate("bookId");

  return downloads.map((d) => d.bookId);
}

export async function deleteDownloadedBook(userId: string, bookId: string) {
  await connectToDatabase();

  // Cập nhật trạng thái thay vì xóa để giữ lịch sử
  const result = await UserDownload.findOneAndUpdate(
    { userId, bookId },
    { status: "DELETED" },
    { new: true }
  );

  return result;
}

export async function addBookmark(
  userId: string,
  bookId: string,
  chapterId: string,
  position: number,
  note?: string
): Promise<ReadingProgressResponse> {
  try {
    await connectToDatabase();

    // Validate chapter exists
    const chapterExists = await Chapter.findById(chapterId);
    if (!chapterExists) {
      return { success: false, message: "Chapter not found" };
    }

    const progress = await ReadingProgress.findOneAndUpdate(
      { userId, bookId },
      {
        $push: {
          bookmarks: {
            chapterId,
            position,
            note,
          },
        },
        $set: { lastReadAt: new Date() },
      },
      { new: true, upsert: true }
    ).populate("bookmarks.chapterId");

    return {
      success: true,
      data: progress.bookmarks[progress.bookmarks.length - 1],
    };
  } catch (error) {
    console.error("Error adding bookmark:", error);
    return { success: false, message: "Failed to add bookmark" };
  }
}

export async function getBookmarks(
  userId: string,
  bookId: string
): Promise<ReadingProgressResponse> {
  try {
    await connectToDatabase();

    const progress = await ReadingProgress.findOne(
      { userId, bookId },
      { bookmarks: 1 }
    )
      .populate("bookmarks.chapterId")
      .sort({ "bookmarks.createdAt": -1 });

    if (!progress) {
      return { success: true, data: [] };
    }

    return { success: true, data: progress.bookmarks };
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return { success: false, message: "Failed to fetch bookmarks" };
  }
}

export async function removeBookmark(
  userId: string,
  bookId: string,
  chapterId: string,
  position: number
): Promise<ReadingProgressResponse> {
  try {
    await connectToDatabase();

    const progress = await ReadingProgress.findOneAndUpdate(
      { userId, bookId },
      {
        $pull: {
          bookmarks: {
            chapterId,
            position,
          },
        },
      },
      { new: true }
    );

    console.log("xoa thanh cong");

    return { success: true, data: progress };
  } catch (error) {
    console.error("Error removing bookmark:", error);
    return { success: false, message: "Failed to remove bookmark" };
  }
}
