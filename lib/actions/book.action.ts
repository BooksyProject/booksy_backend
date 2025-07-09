import mongoose from "mongoose";
import { connectToDatabase } from "../mongoose";
import book from "@/database/book.model";
import { BookDTO, BookResponseDTO, CreateBookDTO } from "@/dtos/BookDTO";
import Book from "@/database/book.model";
import Category from "@/database/category.model";
import Chapter from "@/database/chapter.model";
import User from "@/database/user.model";
import { UserInfo } from "os";
import corsMiddleware from "@/middleware/auth-middleware";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";

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
      createdBy: params.createdBy,
    };

    const newBook = await Book.create(bookData);

    return newBook as BookDTO;
  } catch (error) {
    console.error("Error creating book:", error);
    throw new Error("Error creating book: " + error);
  }
}

export async function updateBook(
  bookId: string,
  updateData: Partial<CreateBookDTO>,
  userId: string // thêm userId ở đây
) {
  try {
    await connectToDatabase();

    const book = await Book.findById(bookId);

    if (!book) {
      throw new Error(`Book with ID ${bookId} does not exist.`);
    }

    if (book.createdBy.toString() !== userId) {
      throw new Error("You do not have permission to update this book.");
    }

    book.title = updateData.title || book.title;
    book.author = updateData.author || book.author;
    book.categories = updateData.categories || book.categories;
    book.description = updateData.description || book.description;
    book.coverImage = updateData.coverImage || book.coverImage;
    book.fileURL = updateData.fileURL || book.fileURL;
    book.fileType = updateData.fileType || book.fileType;

    const updatedBook = await book.save();
    const populatedBook = await Book.findById(updatedBook._id)
      .populate({
        path: "createdBy",
        model: User,
        select: "_id firstName lastName avatar",
      })
      .populate({
        path: "categories",
        model: Category,
        select: "_id name",
      });

    return populatedBook;
  } catch (error) {
    console.error("❌ Error updating book:", error);
    throw new Error("Unable to update book");
  }
}

export async function deleteBook(
  bookId: string,
  userId: string
): Promise<{ success: boolean }> {
  try {
    await connectToDatabase();

    const deleted = await Book.findOneAndDelete({
      _id: bookId,
      createdBy: userId,
    });

    if (!deleted) {
      throw new Error("Book not found or you don't have permission");
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Error deleting book:", error);
    throw new Error("Unable to delete book");
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
      createdBy: book.createdBy,
    }));

    return formattedBooks;
  } catch (error) {
    console.error("Error fetching books:", error);
    throw new Error("Error fetching books: " + error);
  }
}

export const getMyBooks = async (
  userId: string
): Promise<BookResponseDTO[]> => {
  try {
    await connectToDatabase();
    console.log(userId);
    const books = await Book.find({ createdBy: userId }).lean();

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
      createdBy: book.createdBy,
    }));

    return formattedBooks;
  } catch (error) {
    console.error("❌ Error fetching user's books:", error);
    throw new Error("Unable to fetch user's books");
  }
};

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
