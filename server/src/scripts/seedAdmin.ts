import "dotenv/config";

import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import User from "../models/user.js";

const seedAdmin = async (): Promise<void> => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Read admin credentials from .env
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    // 3. Make sure required values exist
    if (!email || !password) {
      throw new Error(
        "ADMIN_EMAIL and ADMIN_PASSWORD must be defined in .env"
      );
    }

    // 4. Basic password check
    if (password.length < 8) {
      throw new Error(
        "ADMIN_PASSWORD must contain at least 8 characters"
      );
    }

    // 5. Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // 6. Check whether this account already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      console.log(`User already exists: ${normalizedEmail}`);
      return;
    }

    // 7. Hash admin password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 8. Create admin account
    await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      role: "admin",
      isActive: true,
    });

    console.log("Admin created successfully");
    console.log(`Admin email: ${normalizedEmail}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Admin seed error: ${error.message}`);
    } else {
      console.error("Unknown admin seed error");
    }

    process.exitCode = 1;
  } finally {
    // 9. Close MongoDB connection after seeding
    await mongoose.connection.close();
  }
};

void seedAdmin();