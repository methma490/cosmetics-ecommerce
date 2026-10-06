import mongoose, {
  Schema,
  type Document,
  type Types,
} from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;

  brand?: string;

  category: Types.ObjectId;

  price: number;
  stock: number;

  images: string[];

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [
        2,
        "Product name must be at least 2 characters",
      ],
      maxlength: [
        150,
        "Product name cannot exceed 150 characters",
      ],
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    description: {
      type: String,
      required: [
        true,
        "Product description is required",
      ],
      trim: true,
      maxlength: [
        3000,
        "Description cannot exceed 3000 characters",
      ],
    },

    brand: {
      type: String,
      trim: true,
      maxlength: [
        100,
        "Brand cannot exceed 100 characters",
      ],
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [
        true,
        "Product category is required",
      ],
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },

    images: {
      type: [String],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| Indexes
|--------------------------------------------------------------------------
*/

productSchema.index({
  name: "text",
  description: "text",
  brand: "text",
});

productSchema.index({
  category: 1,
});

productSchema.index({
  price: 1,
});

productSchema.index({
  stock: 1,
});

const Product = mongoose.model<IProduct>(
  "Product",
  productSchema
);

export default Product;