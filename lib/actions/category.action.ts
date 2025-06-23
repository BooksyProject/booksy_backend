import { CategoryDTO, CategoryResponseDTO } from "@/dtos/CategoryDTO";
import mongoose from "mongoose";
import { connectToDatabase } from "../mongoose";
import Category from "@/database/category.model";

export async function createCategory(
  params: CategoryDTO
): Promise<CategoryDTO> {
  try {
    await connectToDatabase();

    const categoryData = {
      name: params.name || "",
      description: params.description || "",
      uploadedAt: params.uploadedAt || new Date(),
    };

    // Tạo báo cáo mới trong DB
    const newReport = await Category.create(categoryData);

    return newReport as CategoryDTO;
  } catch (error) {
    console.error("Error creating category:", error);
    throw new Error("Error creating category: " + error);
  }
}

export async function getAllCategories(): Promise<CategoryResponseDTO[]> {
  try {
    await connectToDatabase();

    const categories = await Category.find().sort({ uploadedAt: -1 }).lean();

    return categories.map((category: any) => ({
      name: category.name,
      description: category.description,
      uploadedAt: category.uploadedAt,
    })) as CategoryResponseDTO[];
  } catch (error) {
    console.error("Error getting categories:", error);
    throw new Error("Error getting categories: " + error);
  }
}
