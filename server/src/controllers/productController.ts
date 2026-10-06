import type { Request, Response } from "express";
import mongoose from "mongoose";

import Product from "../models/product.js";
import Category from "../models/category.js";
import createSlug from "../utils/createSlug.js";

/*
|--------------------------------------------------------------------------
| GET ALL PRODUCTS
|--------------------------------------------------------------------------
| Public
|
| Supports:
|
| ?search=serum
| ?category=skin-care
| ?minPrice=1000
| ?maxPrice=5000
| ?inStock=true
| ?sort=price-asc
| ?page=1
| ?limit=12
|--------------------------------------------------------------------------
*/

export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      inStock,
      sort,
    } = req.query;

    /*
    |--------------------------------------------------------------------------
    | PAGINATION
    |--------------------------------------------------------------------------
    */

    const rawPage = Number(req.query.page);
    const rawLimit = Number(req.query.limit);

    const page =
      Number.isFinite(rawPage) && rawPage > 0
        ? Math.floor(rawPage)
        : 1;

    const limit =
      Number.isFinite(rawLimit) && rawLimit > 0
        ? Math.min(Math.floor(rawLimit), 50)
        : 12;

    const skip = (page - 1) * limit;

    /*
    |--------------------------------------------------------------------------
    | BASE FILTER
    |--------------------------------------------------------------------------
    */

    const filter: Record<string, unknown> = {};

    if (req.user?.role === "admin" && req.query.includeInactive === "true") {
      // Admin requested all products (active and inactive)
    } else if (req.user?.role === "admin" && req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === "true";
    } else {
      filter.isActive = true;
    }

    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

    if (
      typeof search === "string" &&
      search.trim()
    ) {
      const trimmedSearch = search.trim();
      const escaped = trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const terms = trimmedSearch
        .split(/\s+/)
        .filter((w) => w.length > 1)
        .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

      const searchConditions: Record<string, unknown>[] = [
        { name: { $regex: escaped, $options: "i" } },
        { brand: { $regex: escaped, $options: "i" } },
        { description: { $regex: escaped, $options: "i" } },
      ];

      terms.forEach((t) => {
        searchConditions.push({ name: { $regex: t, $options: "i" } });
        searchConditions.push({ description: { $regex: t, $options: "i" } });
      });

      filter.$or = searchConditions;
    }

    /*
    |--------------------------------------------------------------------------
    | CATEGORY FILTER
    |--------------------------------------------------------------------------
    */

    if (
      typeof category === "string" &&
      category.trim()
    ) {
      const categoryDocument = await Category.findOne({
        slug: category.trim().toLowerCase(),
        isActive: true,
      });

      if (!categoryDocument) {
        res.status(200).json({
          success: true,
          count: 0,
          total: 0,
          page,
          pages: 0,
          products: [],
        });
        return;
      }

      filter.category = categoryDocument._id;
    }

    /*
    |--------------------------------------------------------------------------
    | PRICE FILTER
    |--------------------------------------------------------------------------
    */

    const priceFilter: {
      $gte?: number;
      $lte?: number;
    } = {};

    if (minPrice !== undefined) {
      if (typeof minPrice !== "string") {
        res.status(400).json({
          success: false,
          message: "Invalid minPrice",
        });
        return;
      }

      const value = Number(minPrice);

      if (
        !Number.isFinite(value) ||
        value < 0
      ) {
        res.status(400).json({
          success: false,
          message:
            "minPrice must be a valid non-negative number",
        });
        return;
      }

      priceFilter.$gte = value;
    }

    if (maxPrice !== undefined) {
      if (typeof maxPrice !== "string") {
        res.status(400).json({
          success: false,
          message: "Invalid maxPrice",
        });
        return;
      }

      const value = Number(maxPrice);

      if (
        !Number.isFinite(value) ||
        value < 0
      ) {
        res.status(400).json({
          success: false,
          message:
            "maxPrice must be a valid non-negative number",
        });
        return;
      }

      priceFilter.$lte = value;
    }

    if (
      priceFilter.$gte !== undefined &&
      priceFilter.$lte !== undefined &&
      priceFilter.$gte > priceFilter.$lte
    ) {
      res.status(400).json({
        success: false,
        message:
          "minPrice cannot be greater than maxPrice",
      });
      return;
    }

    if (Object.keys(priceFilter).length > 0) {
      filter.price = priceFilter;
    }

    /*
    |--------------------------------------------------------------------------
    | STOCK FILTER
    |--------------------------------------------------------------------------
    */

    if (inStock !== undefined) {
      if (
        inStock !== "true" &&
        inStock !== "false"
      ) {
        res.status(400).json({
          success: false,
          message:
            "inStock must be true or false",
        });
        return;
      }

      if (inStock === "true") {
        filter.stock = {
          $gt: 0,
        };
      }

      if (inStock === "false") {
        filter.stock = 0;
      }
    }

    /*
    |--------------------------------------------------------------------------
    | SORTING
    |--------------------------------------------------------------------------
    */

    let sortOption: Record<string, 1 | -1> = {
      createdAt: -1,
    };

    if (typeof sort === "string") {
      switch (sort) {
        case "price-asc":
          sortOption = {
            price: 1,
          };
          break;

        case "price-desc":
          sortOption = {
            price: -1,
          };
          break;

        case "name-asc":
          sortOption = {
            name: 1,
          };
          break;

        case "name-desc":
          sortOption = {
            name: -1,
          };
          break;

        case "oldest":
          sortOption = {
            createdAt: 1,
          };
          break;

        case "newest":
          sortOption = {
            createdAt: -1,
          };
          break;

        default:
          sortOption = {
            createdAt: -1,
          };
      }
    }

    /*
    |--------------------------------------------------------------------------
    | DATABASE QUERY
    |--------------------------------------------------------------------------
    */

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate(
          "category",
          "name slug"
        )
        .sort(sortOption)
        .skip(skip)
        .limit(limit),

      Product.countDocuments(filter),
    ]);

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    res.status(200).json({
      success: true,

      count: products.length,

      total,

      page,

      limit,

      pages:
        total === 0
          ? 0
          : Math.ceil(total / limit),

      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to get products",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET ONE PRODUCT BY SLUG
|--------------------------------------------------------------------------
| Public
|--------------------------------------------------------------------------
*/

export const getProductBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

    if (typeof slug !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid product slug",
      });
      return;
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(slug);
    const query: Record<string, unknown> = isObjectId
      ? { $or: [{ _id: slug }, { slug: slug.toLowerCase() }] }
      : { slug: slug.toLowerCase() };

    if (req.user?.role !== "admin") {
      query.isActive = true;
    }

    const product = await Product.findOne(query).populate(
      "category",
      "name slug"
    );

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to get product",
    });
  }
};

/*
|--------------------------------------------------------------------------
| CREATE PRODUCT
|--------------------------------------------------------------------------
| Admin only
|--------------------------------------------------------------------------
*/

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      description,
      brand,
      category,
      price,
      stock,
      images,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | REQUIRED FIELDS
    |--------------------------------------------------------------------------
    */

    if (
      !name ||
      !description ||
      !category ||
      price === undefined
    ) {
      res.status(400).json({
        success: false,
        message:
          "Name, description, category and price are required",
      });
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | NAME
    |--------------------------------------------------------------------------
    */

    if (typeof name !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid product name",
      });
      return;
    }

    const cleanName = name.trim();

    if (cleanName.length < 2) {
      res.status(400).json({
        success: false,
        message:
          "Product name must be at least 2 characters",
      });
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | DESCRIPTION
    |--------------------------------------------------------------------------
    */

    if (
      typeof description !== "string" ||
      !description.trim()
    ) {
      res.status(400).json({
        success: false,
        message:
          "Product description is required",
      });
      return;
    }

    const cleanDescription =
      description.trim();

    /*
    |--------------------------------------------------------------------------
    | BRAND
    |--------------------------------------------------------------------------
    */

    if (
      brand !== undefined &&
      typeof brand !== "string"
    ) {
      res.status(400).json({
        success: false,
        message: "Brand must be text",
      });
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | CATEGORY
    |--------------------------------------------------------------------------
    */

    if (
      typeof category !== "string" ||
      !mongoose.Types.ObjectId.isValid(
        category
      )
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
      return;
    }

    const categoryExists =
      await Category.findOne({
        _id: category,
        isActive: true,
      });

    if (!categoryExists) {
      res.status(400).json({
        success: false,
        message:
          "Selected category does not exist or is inactive",
      });
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | PRICE
    |--------------------------------------------------------------------------
    */

    const numericPrice = Number(price);

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 0
    ) {
      res.status(400).json({
        success: false,
        message:
          "Price must be a valid non-negative number",
      });
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | STOCK
    |--------------------------------------------------------------------------
    */

    const numericStock =
      stock === undefined
        ? 0
        : Number(stock);

    if (
      !Number.isInteger(numericStock) ||
      numericStock < 0
    ) {
      res.status(400).json({
        success: false,
        message:
          "Stock must be a non-negative whole number",
      });
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | IMAGES
    |--------------------------------------------------------------------------
    */

    if (images !== undefined) {
      if (
        !Array.isArray(images) ||
        !images.every(
          (image) =>
            typeof image === "string"
        )
      ) {
        res.status(400).json({
          success: false,
          message:
            "Images must be an array of URLs",
        });
        return;
      }
    }

    /*
    |--------------------------------------------------------------------------
    | SLUG
    |--------------------------------------------------------------------------
    */

    let slug = createSlug(cleanName);

    if (!slug) {
      res.status(400).json({
        success: false,
        message: "Invalid product name",
      });
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | UNIQUE SLUG
    |--------------------------------------------------------------------------
    */

    const existingSlug =
      await Product.findOne({
        slug,
      });

    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE PRODUCT
    |--------------------------------------------------------------------------
    */

    const product = await Product.create({
      name: cleanName,

      slug,

      description: cleanDescription,

      brand:
        typeof brand === "string"
          ? brand.trim()
          : undefined,

      category: categoryExists._id,

      price: numericPrice,

      stock: numericStock,

      images:
        images !== undefined
          ? images
          : [],

      isActive: true,
    });

    /*
    |--------------------------------------------------------------------------
    | POPULATE CATEGORY
    |--------------------------------------------------------------------------
    */

    const populatedProduct =
      await Product.findById(
        product._id
      ).populate(
        "category",
        "name slug"
      );

    res.status(201).json({
      success: true,

      message:
        "Product created successfully",

      product: populatedProduct,
    });
  } catch (error) {
    console.error("Create product error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create product",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE PRODUCT
|--------------------------------------------------------------------------
| Admin only
|--------------------------------------------------------------------------
*/

export const updateProduct = async (
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
        message: "Invalid product ID",
      });
      return;
    }

    const product =
      await Product.findById(id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    const {
      name,
      description,
      brand,
      category,
      price,
      stock,
      images,
      isActive,
    } = req.body;

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
          message:
            "Product name must be at least 2 characters",
        });
        return;
      }

      const cleanName = name.trim();

      let newSlug =
        createSlug(cleanName);

      if (!newSlug) {
        res.status(400).json({
          success: false,
          message: "Invalid product name",
        });
        return;
      }

      const slugOwner =
        await Product.findOne({
          _id: {
            $ne: product._id,
          },
          slug: newSlug,
        });

      if (slugOwner) {
        newSlug =
          `${newSlug}-${Date.now()}`;
      }

      product.name = cleanName;
      product.slug = newSlug;
    }

    /*
    |--------------------------------------------------------------------------
    | DESCRIPTION
    |--------------------------------------------------------------------------
    */

    if (description !== undefined) {
      if (
        typeof description !== "string" ||
        !description.trim()
      ) {
        res.status(400).json({
          success: false,
          message:
            "Description cannot be empty",
        });
        return;
      }

      product.description =
        description.trim();
    }

    /*
    |--------------------------------------------------------------------------
    | BRAND
    |--------------------------------------------------------------------------
    */

    if (brand !== undefined) {
      if (typeof brand !== "string") {
        res.status(400).json({
          success: false,
          message: "Brand must be text",
        });
        return;
      }

      product.brand = brand.trim();
    }

    /*
    |--------------------------------------------------------------------------
    | CATEGORY
    |--------------------------------------------------------------------------
    */

    if (category !== undefined) {
      if (
        typeof category !== "string" ||
        !mongoose.Types.ObjectId.isValid(
          category
        )
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
        return;
      }

      const categoryExists =
        await Category.findOne({
          _id: category,
          isActive: true,
        });

      if (!categoryExists) {
        res.status(400).json({
          success: false,
          message:
            "Selected category does not exist or is inactive",
        });
        return;
      }

      product.category =
        categoryExists._id;
    }

    /*
    |--------------------------------------------------------------------------
    | PRICE
    |--------------------------------------------------------------------------
    */

    if (price !== undefined) {
      const numericPrice =
        Number(price);

      if (
        !Number.isFinite(
          numericPrice
        ) ||
        numericPrice < 0
      ) {
        res.status(400).json({
          success: false,
          message:
            "Price must be a valid non-negative number",
        });
        return;
      }

      product.price =
        numericPrice;
    }

    /*
    |--------------------------------------------------------------------------
    | STOCK / INVENTORY
    |--------------------------------------------------------------------------
    */

    if (stock !== undefined) {
      const numericStock =
        Number(stock);

      if (
        !Number.isInteger(
          numericStock
        ) ||
        numericStock < 0
      ) {
        res.status(400).json({
          success: false,
          message:
            "Stock must be a non-negative whole number",
        });
        return;
      }

      product.stock =
        numericStock;
    }

    /*
    |--------------------------------------------------------------------------
    | IMAGES
    |--------------------------------------------------------------------------
    */

    if (images !== undefined) {
      if (
        !Array.isArray(images) ||
        !images.every(
          (image) =>
            typeof image === "string"
        )
      ) {
        res.status(400).json({
          success: false,
          message:
            "Images must be an array of URLs",
        });
        return;
      }

      product.images = images;
    }

    /*
    |--------------------------------------------------------------------------
    | ACTIVE STATUS
    |--------------------------------------------------------------------------
    */

    if (isActive !== undefined) {
      if (
        typeof isActive !== "boolean"
      ) {
        res.status(400).json({
          success: false,
          message:
            "isActive must be true or false",
        });
        return;
      }

      product.isActive =
        isActive;
    }

    /*
    |--------------------------------------------------------------------------
    | SAVE
    |--------------------------------------------------------------------------
    */

    await product.save();

    /*
    |--------------------------------------------------------------------------
    | RETURN UPDATED PRODUCT
    |--------------------------------------------------------------------------
    */

    const updatedProduct =
      await Product.findById(
        product._id
      ).populate(
        "category",
        "name slug"
      );

    res.status(200).json({
      success: true,

      message:
        "Product updated successfully",

      product: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update product",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE PRODUCT
|--------------------------------------------------------------------------
| Admin only
|--------------------------------------------------------------------------
*/

export const deleteProduct = async (
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
        message: "Invalid product ID",
      });
      return;
    }

    const product =
      await Product.findById(id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete product",
    });
  }
};