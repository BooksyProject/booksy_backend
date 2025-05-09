import Category from "@/database/category.model";
import { createCategory } from "@/lib/actions/category.action";
import corsMiddleware from "@/middleware/auth-middleware";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res, async () => {
    if (req.method === "POST") {
      try {
        const { name, description, uploadedAt } = req.body;

        if (!name || !description) {
          return res.status(400).json({ message: "Missing required fields" });
        }

        const category = await createCategory({
          name,
          description,
          uploadedAt,
        });

        return res
          .status(201)
          .json({ message: "Category created successfully", category });
      } catch (error: any) {
        if (error.code === 11000) {
          return res.status(400).json({ message: "Category already exists" });
        }
        return res
          .status(500)
          .json({ message: "Server error", error: error.message });
      }
    } else {
      return res.status(405).json({ message: "Method Not Allowed" });
    }
  });
}
