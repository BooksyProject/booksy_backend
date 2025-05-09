import mongoose from "mongoose";
import { connectToDatabase } from "../mongoose";
import book from "@/database/book.model";
import { BookDTO, CreateBookDTO } from "@/dtos/BookDTO";
import Book from "@/database/book.model";

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
