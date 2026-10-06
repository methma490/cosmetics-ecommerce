import type { Request, Response } from "express";
import bcrypt from "bcryptjs";

import User from "../models/user.js";
import UserProfile from "../models/userProfile.js";

import generateToken from "../utils/generateToken.js";

import {
  clearAuthCookie,
  setAuthCookie,
} from "../utils/authCookie.js";

/*
|--------------------------------------------------------------------------
| REGISTER CUSTOMER
|--------------------------------------------------------------------------
*/

export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Required fields
    |--------------------------------------------------------------------------
    */

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password
    ) {
      res.status(400).json({
        success: false,
        message:
          "First name, last name, email and password are required",
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Basic input checks
    |--------------------------------------------------------------------------
    */

    if (
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid registration data",
      });

      return;
    }

    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const normalizedEmail = email
      .trim()
      .toLowerCase();

    if (
      cleanFirstName.length < 2 ||
      cleanLastName.length < 2
    ) {
      res.status(400).json({
        success: false,
        message:
          "First name and last name must contain at least 2 characters",
      });

      return;
    }

    if (password.length < 8) {
      res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters",
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Check email
    |--------------------------------------------------------------------------
    */

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Hash password
    |--------------------------------------------------------------------------
    */

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    /*
    |--------------------------------------------------------------------------
    | Create users document
    |--------------------------------------------------------------------------
    */

    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword,

      // Never accept role from registration body
      role: "customer",

      isActive: true,
    });

    /*
    |--------------------------------------------------------------------------
    | Create userprofiles document
    |--------------------------------------------------------------------------
    */

    let profile;

    try {
      profile = await UserProfile.create({
        user: user._id,
        firstName: cleanFirstName,
        lastName: cleanLastName,
      });
    } catch (profileError) {
      // Remove account if profile creation fails.
      await User.findByIdAndDelete(user._id);

      throw profileError;
    }

    /*
    |--------------------------------------------------------------------------
    | Generate JWT
    |--------------------------------------------------------------------------
    */

    const token = generateToken(
      user._id.toString(),
      user.role
    );

    /*
    |--------------------------------------------------------------------------
    | Store JWT in HttpOnly cookie
    |--------------------------------------------------------------------------
    */

    setAuthCookie(res, token);

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    res.status(201).json({
      success: true,
      message: "Account created successfully",

      user: {
        id: user._id,

        email: user.email,

        role: user.role,

        profile: {
          firstName: profile.firstName,
          lastName: profile.lastName,
        },
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create account",
    });
  }
};

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });

      return;
    }

    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid login data",
      });

      return;
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    /*
    |--------------------------------------------------------------------------
    | Find user
    |--------------------------------------------------------------------------
    |
    | password has select:false in user.ts.
    | Therefore +password is required here.
    |
    */

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Check active account
    |--------------------------------------------------------------------------
    */

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: "Account is disabled",
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Check password
    |--------------------------------------------------------------------------
    */

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Generate JWT
    |--------------------------------------------------------------------------
    */

    const token = generateToken(
      user._id.toString(),
      user.role
    );

    /*
    |--------------------------------------------------------------------------
    | Store JWT in cookie
    |--------------------------------------------------------------------------
    */

    setAuthCookie(res, token);

    /*
    |--------------------------------------------------------------------------
    | Get profile
    |--------------------------------------------------------------------------
    */

    const profile =
      user.role === "customer"
        ? await UserProfile.findOne({
            user: user._id,
          })
        : null;

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    res.status(200).json({
      success: true,
      message: "Login successful",

      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to login",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET CURRENT LOGGED-IN USER
|--------------------------------------------------------------------------
*/

export const getMe = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    /*
    |--------------------------------------------------------------------------
    | req.user comes from protect middleware
    |--------------------------------------------------------------------------
    */

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Find account
    |--------------------------------------------------------------------------
    */

    const user = await User.findById(
      req.user.userId
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Get customer profile
    |--------------------------------------------------------------------------
    */

    const profile =
      user.role === "customer"
        ? await UserProfile.findOne({
            user: user._id,
          })
        : null;

    /*
    |--------------------------------------------------------------------------
    | Return logged-in user
    |--------------------------------------------------------------------------
    */

    res.status(200).json({
      success: true,

      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        profile,
      },
    });
  } catch (error) {
    console.error("Get me error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to get user details",
    });
  }
};

/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

export const logout = (
  _req: Request,
  res: Response
): void => {
  /*
  |--------------------------------------------------------------------------
  | Delete accessToken cookie
  |--------------------------------------------------------------------------
  */

  clearAuthCookie(res);

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};