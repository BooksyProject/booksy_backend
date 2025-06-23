import mongoose from "mongoose";
import { connectToDatabase } from "../mongoose";
import book from "@/database/book.model";
import { BookDTO, BookResponseDTO, CreateBookDTO } from "@/dtos/BookDTO";
import Book from "@/database/book.model";
import Category from "@/database/category.model";
import Chapter from "@/database/chapter.model";
import User from "@/database/user.model";
import { UserInfo } from "os";

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
      $inc: { likes: 1, views: 1 }, // Increment both likes and views by 1
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
