import mongoose, {
  Schema,
  type Document,
  type Types,
} from "mongoose";

export interface IUserProfile extends Document {
  user: Types.ObjectId;

  firstName: string;
  lastName: string;

  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;

  createdAt: Date;
  updatedAt: Date;
}

const userProfileSchema = new Schema<IUserProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },

    phone: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

    postalCode: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const UserProfile = mongoose.model<IUserProfile>(
  "UserProfile",
  userProfileSchema
);

export default UserProfile;