export interface BookDTO {
  title: string;
  author: string;
  categories: string[];
  description: string;
  coverImage: string;
  fileURL: string;
  fileType: "EPUB" | "PDF";
  views: number;
  likes: number;
  uploadedAt: Date;
}

export interface CreateBookDTO {
  title: string;
  author: string;
  categories: string[];
  description: string;
  coverImage: string;
  fileURL: string;
  fileType: "EPUB" | "PDF";
  createdBy: string;
}

export interface BookResponseDTO {
  _id: string;
  title: string;
  author: string;
  categories: string[];
  description: string;
  coverImage: string;
  fileURL: string;
  fileType: "EPUB" | "PDF";
  views: number;
  likes: number;
  uploadedAt: Date;
  createdBy: string;
}

export interface BookmarkDTO {
  chapterId: string;
  position: number;
  note?: string;
  createdAt?: Date;
}

export interface ReadingProgressResponse {
  success: boolean;
  message?: string;
  data?: any;
}
