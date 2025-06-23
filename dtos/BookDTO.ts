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
}

export interface BookResponseDTO {
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
