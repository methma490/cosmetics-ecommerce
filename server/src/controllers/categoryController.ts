import type { Request, Response } from "express";
import mongoose from "mongoose";

import Category from "../models/category.js";
import Product from "../models/product.js";
import createSlug from "../utils/createSlug.js";

/*
|--------------------------------------------------------------------------
| GET ALL ACTIVE CATEGORIES
|--------------------------------------------------------------------------
| Public
|--------------------------------------------------------------------------
*/

export const getCategories = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const categories = await Category.find({
      isActive: true,
    }).sort({
      name: 1,
    });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to get categories",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET CATEGORY BY SLUG
|--------------------------------------------------------------------------
| Public
|--------------------------------------------------------------------------
*/

export const getCategoryBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

    if (typeof slug !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid category slug",
      });
      return;
    }

    const category = await Category.findOne({
      slug: slug.toLowerCase(),
      isActive: true,
    });

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Get category error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to get category",
    });
  }
};

/*
|--------------------------------------------------------------------------
| CREATE CATEGORY
|--------------------------------------------------------------------------
| Admin only
|--------------------------------------------------------------------------
*/

export const createCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        message: "Category name is required",
      });
      return;
    }

    if (typeof name !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid category name",
      });
      return;
    }

    const cleanName = name.trim();

    if (cleanName.length < 2) {
      res.status(400).json({
        success: false,
        message: "Category name must be at least 2 characters",
      });
      return;
    }

    if (
      description !== undefined &&
      typeof description !== "string"
    ) {
      res.status(400).json({
        success: false,
        message: "Description must be text",
      });
      return;
    }

    const slug = createSlug(cleanName);

    if (!slug) {
      res.status(400).json({
        success: false,
        message: "Invalid category name",
      });
      return;
    }

    const existingCategory = await Category.findOne({
      $or: [
        {
          name: {
            $regex: `^${cleanName}$`,
            $options: "i",
          },
        },
        {
          slug,
        },
      ],
    });

    if (existingCategory) {
      res.status(409).json({
        success: false,
        message: "Category already exists",
      });
      return;
    }

    const category = await Category.create({
      name: cleanName,
      slug,
      description:
        typeof description === "string"
          ? description.trim()
          : undefined,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create category error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create category",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE CATEGORY
|--------------------------------------------------------------------------
| Admin only
|--------------------------------------------------------------------------
*/

export const updateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    /*
    |--------------------------------------------------------------------------
    | IMPORTANT TYPESCRIPT FIX
    |--------------------------------------------------------------------------
    */

    if (
      typeof id !== "string" ||
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
      return;
    }

    const category = await Category.findById(id);

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    const { name, description, isActive } = req.body;

    /*
    |--------------------------------------------------------------------------
    | NAME
    |--------------------------------------------------------------------------
    */

    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        name.trim().length < 2
      ) {
        res.status(400).json({
          success: false,
          message: "Category name must be at least 2 characters",
        });
        return;
      }

      const cleanName = name.trim();
      const newSlug = createSlug(cleanName);

      if (!newSlug) {
        res.status(400).json({
          success: false,
          message: "Invalid category name",
        });
        return;
      }

      const duplicateCategory = await Category.findOne({
        _id: {
          $ne: category._id,
        },
        $or: [
          {
            name: {
              $regex: `^${cleanName}$`,
              $options: "i",
            },
          },
          {
            slug: newSlug,
          },
        ],
      });

      if (duplicateCategory) {
        res.status(409).json({
          success: false,
          message:
            "Another category with this name already exists",
        });
        return;
      }

      category.name = cleanName;
      category.slug = newSlug;
    }

    /*
    |--------------------------------------------------------------------------
    | DESCRIPTION
    |--------------------------------------------------------------------------
    */

    if (description !== undefined) {
      if (typeof description !== "string") {
        res.status(400).json({
          success: false,
          message: "Description must be text",
        });
        return;
      }

      category.description = description.trim();
    }

    /*
    |--------------------------------------------------------------------------
    | ACTIVE STATUS
    |--------------------------------------------------------------------------
    */

    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        res.status(400).json({
          success: false,
          message: "isActive must be true or false",
        });
        return;
      }

      category.isActive = isActive;
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update category error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update category",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE CATEGORY
|--------------------------------------------------------------------------
| Admin only
|--------------------------------------------------------------------------
*/

export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    /*
    |--------------------------------------------------------------------------
    | IMPORTANT TYPESCRIPT FIX
    |--------------------------------------------------------------------------
    */

    if (
      typeof id !== "string" ||
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
      return;
    }

    const category = await Category.findById(id);

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | DON'T DELETE CATEGORY IF PRODUCTS USE IT
    |--------------------------------------------------------------------------
    */

    const productCount = await Product.countDocuments({
      category: category._id,
    });

    if (productCount > 0) {
      res.status(409).json({
        success: false,
        message:
          "Cannot delete this category because it contains products",
      });
      return;
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete category",
    });
  }
};