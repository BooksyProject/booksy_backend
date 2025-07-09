import { Schema } from "mongoose";

// DTO dùng để tạo chương mới
export interface CreateChapterDTO {
  bookId: string; // gửi từ FE là string
  chapterTitle: string;
  content: string;
  chapterNumber?: number; // tùy chọn
}

// DTO dùng để cập nhật chương
export interface UpdateChapterDTO {
  chapterTitle?: string;
  content?: string;
  chapterNumber?: number;
}

// DTO trả về khi fetch chương
export interface ChapterResponseDTO {
  _id: string;
  bookId: string;
  chapterTitle: string;
  content: string;
  chapterNumber: number;
  uploadedAt: Date;
  comments: string[]; // mảng commentId
}
