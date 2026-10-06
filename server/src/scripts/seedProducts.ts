/*import "dotenv/config";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import Category from "../models/category.js";
import Product from "../models/product.js";
import createSlug from "../utils/createSlug.js";

const categoriesData = [
  {
    name: "Skincare",
    slug: "skincare",
    description: "Nourishing serums, cleansers, and moisturizers for radiant, healthy skin.",
  },
  {
    name: "Makeup",
    slug: "makeup",
    description: "Elevated beauty essentials for eyes, lips, and luminous complexion.",
  },
  {
    name: "Fragrance",
    slug: "fragrance",
    description: "Exquisite artisanal perfumes and delicate mist scents.",
  },
  {
    name: "Hair Care",
    slug: "hair-care",
    description: "Restorative shampoos, masks, and botanical oils for silky vitality.",
  },
  {
    name: "Body Care",
    slug: "body-care",
    description: "Indulgent scrubs, lotions, and velvety body butters.",
  },
];

const productsData = [
  {
    name: "Luminous Botanical Radiance Serum",
    categorySlug: "skincare",
    brand: "Lumière Botanique",
    price: 4850,
    stock: 24,
    description:
      "A revitalizing face serum infused with botanical antioxidants, niacinamide, and hyaluronic acid. Restores natural skin glow and deeply hydrates without heaviness.",
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1608248597359-0a6932598379?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Velvet Rose Hydrating Day Cream",
    categorySlug: "skincare",
    brand: "Rose & Herb",
    price: 5200,
    stock: 18,
    description:
      "Ultra-hydrating daily moisturizer packed with Damask rose water and ceramides. Shields the skin barrier and leaves a velvety, soft-matte finish.",
    images: [
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Pure Dew Gentle Foaming Cleanser",
    categorySlug: "skincare",
    brand: "Aura Essentials",
    price: 3400,
    stock: 30,
    description:
      "Mild, sulfate-free cleanser that purifies impurities while maintaining optimal skin moisture balance. Enriched with chamomile and green tea extract.",
    images: [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Silk Petal Satin Matte Lipstick",
    categorySlug: "makeup",
    brand: "Velour Paris",
    price: 2900,
    stock: 35,
    description:
      "Long-wearing, weightless lipstick infused with shea butter and vitamin E. Delivers rich rose-tinted pigment in a single stroke with unmatched comfort.",
    images: [
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Celestial Glow Liquid Highlighter",
    categorySlug: "makeup",
    brand: "Glow Atelier",
    price: 3750,
    stock: 22,
    description:
      "A multi-dimensional liquid illuminator that catches light seamlessly. Blends effortlessly on high points of the face or mixed with foundation.",
    images: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Smoky Quartz Mineral Eyeshadow Palette",
    categorySlug: "makeup",
    brand: "Velour Paris",
    price: 6100,
    stock: 15,
    description:
      "Nine velvety neutral, rose-gold, and deep plum shades formulated with finely-milled mineral pigments. Silky blendability with zero fallout.",
    images: [
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Maison Fleur Eau De Parfum",
    categorySlug: "fragrance",
    brand: "Maison Fleur",
    price: 14500,
    stock: 10,
    description:
      "An evocative fragrance featuring notes of French peony, crisp bergamot, creamy sandalwood, and white musk. Sophisticated and memorable for everyday luxury.",
    images: [
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Amber Twilight Perfumed Oil",
    categorySlug: "fragrance",
    brand: "Maison Fleur",
    price: 9800,
    stock: 12,
    description:
      "Concentrated rollerball perfume oil with rich amber, vanilla orchid, and spicy pink pepper. Melts into warm skin for long-lasting, intimate sillage.",
    images: [
      "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Golden Argan Restorative Hair Elixir",
    categorySlug: "hair-care",
    brand: "Botanique Botanicals",
    price: 4100,
    stock: 25,
    description:
      "Weightless Moroccan argan oil treatment that tames frizz, protects against heat styling, and restores natural mirror-like shine.",
    images: [
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Botanical Keratin Intensive Repair Mask",
    categorySlug: "hair-care",
    brand: "Botanique Botanicals",
    price: 3900,
    stock: 16,
    description:
      "Deep conditioning weekly treatment that fortifies distressed strands with plant keratin, cold-pressed marula oil, and amino acids.",
    images: [
      "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Sweet Almond & Shea Body Soufflé",
    categorySlug: "body-care",
    brand: "Aura Essentials",
    price: 3600,
    stock: 20,
    description:
      "Whipped, deeply replenishing body cream that melts instantly into the skin. Delivers 48-hour moisture with an intoxicating subtle almond scent.",
    images: [
      "https://images.unsplash.com/photo-1556228722-d0b71e16f391?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    name: "Pink Himalayan Salt Detox Body Polish",
    categorySlug: "body-care",
    brand: "Rose & Herb",
    price: 2950,
    stock: 28,
    description:
      "Mineral-rich crystalline body scrub with crushed rose petals and sweet almond oil. Gently buffs away dead skin cells to reveal radiant silkiness.",
    images: [
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80",
    ],
  },
];

const seedProducts = async (): Promise<void> => {
  try {
    await connectDB();

    console.log("Seeding categories...");
    const categoryMap = new Map<string, mongoose.Types.ObjectId>();

    for (const catData of categoriesData) {
      let category = await Category.findOne({ slug: catData.slug });
      if (!category) {
        category = await Category.create({
          name: catData.name,
          slug: catData.slug,
          description: catData.description,
          isActive: true,
        });
        console.log(`Created category: ${catData.name}`);
      } else {
        console.log(`Category exists: ${catData.name}`);
      }
      categoryMap.set(catData.slug, category._id as mongoose.Types.ObjectId);
    }

    console.log("Seeding products...");
    for (const prodData of productsData) {
      const categoryId = categoryMap.get(prodData.categorySlug);
      if (!categoryId) continue;

      const slug = createSlug(prodData.name);
      const existing = await Product.findOne({
        $or: [{ slug }, { name: prodData.name }],
      });

      if (!existing) {
        await Product.create({
          name: prodData.name,
          slug,
          description: prodData.description,
          brand: prodData.brand,
          category: categoryId,
          price: prodData.price,
          stock: prodData.stock,
          images: prodData.images,
          isActive: true,
        });
        console.log(`Created product: ${prodData.name}`);
      } else {
        console.log(`Product exists: ${prodData.name}`);
      }
    }

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Seed products error:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

void seedProducts();
*/