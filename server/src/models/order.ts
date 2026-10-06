import mongoose, {
  Schema,
  type Document,
  type Types,
} from "mongoose";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

export type PaymentMethod =
  | "payhere"
  | "whatsapp";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

/*
|--------------------------------------------------------------------------
| CUSTOMER SNAPSHOT
|--------------------------------------------------------------------------
*/

export interface IOrderCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  address: string;
  apartment?: string;

  city: string;
  postalCode?: string;
  country: string;
}

/*
|--------------------------------------------------------------------------
| ORDER ITEM SNAPSHOT
|--------------------------------------------------------------------------
*/

export interface IOrderItem {
  product: Types.ObjectId;

  name: string;
  image?: string;

  price: number;
  quantity: number;
  subtotal: number;
}

/*
|--------------------------------------------------------------------------
| ORDER DOCUMENT
|--------------------------------------------------------------------------
*/

export interface IOrder extends Document {
  orderNumber: string;

  user: Types.ObjectId;

  customer: IOrderCustomer;

  items: IOrderItem[];

  subtotal: number;
  shippingFee: number;
  total: number;

  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;

  orderStatus: OrderStatus;

  payHerePaymentId?: string;

  inventoryDeducted: boolean;

  createdAt: Date;
  updatedAt: Date;
}

/*
|--------------------------------------------------------------------------
| CUSTOMER SCHEMA
|--------------------------------------------------------------------------
*/

const orderCustomerSchema =
  new Schema<IOrderCustomer>(
    {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },

      lastName: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      address: {
        type: String,
        required: true,
        trim: true,
      },

      apartment: {
        type: String,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      postalCode: {
        type: String,
        trim: true,
      },

      country: {
        type: String,
        required: true,
        trim: true,
        default: "Sri Lanka",
      },
    },
    {
      _id: false,
    }
  );

/*
|--------------------------------------------------------------------------
| ORDER ITEM SCHEMA
|--------------------------------------------------------------------------
*/

const orderItemSchema =
  new Schema<IOrderItem>(
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },

      name: {
        type: String,
        required: true,
        trim: true,
      },

      image: {
        type: String,
        trim: true,
      },

      price: {
        type: Number,
        required: true,
        min: 0,
      },

      quantity: {
        type: Number,
        required: true,
        min: 1,
      },

      subtotal: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    {
      _id: false,
    }
  );

/*
|--------------------------------------------------------------------------
| ORDER SCHEMA
|--------------------------------------------------------------------------
*/

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    customer: {
      type: orderCustomerSchema,
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,

      validate: {
        validator: (
          items: IOrderItem[]
        ) => items.length > 0,

        message:
          "Order must contain at least one product",
      },
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: [
        "payhere",
        "whatsapp",
      ],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "refunded",
      ],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    payHerePaymentId: {
      type: String,
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Prevent double stock deduction
    |--------------------------------------------------------------------------
    */

    inventoryDeducted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

orderSchema.index({
  user: 1,
  createdAt: -1,
});

orderSchema.index({
  orderStatus: 1,
});

orderSchema.index({
  paymentStatus: 1,
});

orderSchema.index({
  paymentMethod: 1,
});

/*
|--------------------------------------------------------------------------
| MODEL
|--------------------------------------------------------------------------
*/

const Order =
  mongoose.model<IOrder>(
    "Order",
    orderSchema
  );

export default Order;