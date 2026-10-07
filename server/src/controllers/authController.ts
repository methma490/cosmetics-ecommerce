import type { Request, Response } from "express";
import bcrypt from "bcryptjs";

import User from "../models/user.js";
import UserProfile from "../models/userProfile.js";
import Cart from "../models/cart.js";

import generateToken from "../utils/generateToken.js";

import {
  clearAuthCookie,
  setAuthCookie,
} from "../utils/authCookie.js";

import { sendVerificationCodeEmail } from "../services/emailService.js";

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
    | Check if email is already registered in database
    |--------------------------------------------------------------------------
    | Strict check: cannot register if an account with this email already exists
    |--------------------------------------------------------------------------
    */

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message:
          "An account with this email address already exists. Please sign in or use a different email.",
      });

      return;
    }

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    /*
    |--------------------------------------------------------------------------
    | Create user with verification code
    |--------------------------------------------------------------------------
    */

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      role: "customer",
      isActive: true,
      isVerified: false,
      verificationCode,
      verificationCodeExpires,
    });

    /*
    |--------------------------------------------------------------------------
    | Create user profile
    |--------------------------------------------------------------------------
    */

    try {
      await UserProfile.create({
        user: user._id,
        firstName: cleanFirstName,
        lastName: cleanLastName,
      });
    } catch (profileError) {
      await User.findByIdAndDelete(user._id);
      throw profileError;
    }

    /*
    |--------------------------------------------------------------------------
    | Send verification email (OTP)
    |--------------------------------------------------------------------------
    */

    const emailResult = await sendVerificationCodeEmail(
      normalizedEmail,
      cleanFirstName,
      verificationCode
    );

    if (!emailResult.sent) {
      // Clean up newly created unverified account so user is not blocked
      await User.findByIdAndDelete(user._id);
      await UserProfile.findOneAndDelete({ user: user._id });

      res.status(500).json({
        success: false,
        message:
          emailResult.error ||
          "Failed to send verification email. Please check your SMTP configuration in server/.env.",
      });

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Response (Requires verification)
    |--------------------------------------------------------------------------
    */

    res.status(201).json({
      success: true,
      requiresVerification: true,
      email: user.email,
      message:
        "Account created! We have sent a 6-digit verification code to your email inbox.",
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      res.status(409).json({
        success: false,
        message:
          "An account with this email address already exists. Please sign in or use a different email.",
      });

      return;
    }

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
    | Check email verification status
    |--------------------------------------------------------------------------
    */

    if (user.role === "customer" && user.isVerified === false) {
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);

      user.verificationCode = verificationCode;
      user.verificationCodeExpires = verificationCodeExpires;
      await user.save();

      const profile = await UserProfile.findOne({ user: user._id });
      const emailResult = await sendVerificationCodeEmail(
        user.email,
        profile?.firstName || "Valued Client",
        verificationCode
      );

      if (!emailResult.sent) {
        res.status(500).json({
          success: false,
          message:
            emailResult.error ||
            "Unable to deliver verification email. Please check your SMTP configuration in server/.env.",
        });

        return;
      }

      res.status(403).json({
        success: false,
        requiresVerification: true,
        email: user.email,
        message:
          "Your email address is not verified yet. We have sent a 6-digit verification code to your email inbox.",
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
      token,
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
      res.status(200).json({
        success: true,
        user: null,
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
      clearAuthCookie(res);
      res.status(200).json({
        success: true,
        user: null,
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

/*
|--------------------------------------------------------------------------
| VERIFY EMAIL (6-DIGIT OTP)
|--------------------------------------------------------------------------
*/

export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      res.status(400).json({
        success: false,
        message: "Email address and 6-digit verification code are required.",
      });

      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanCode = code.toString().trim();

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+verificationCode +verificationCodeExpires"
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: "Account not found with this email address.",
      });

      return;
    }

    if (user.isVerified) {
      // User is already verified, log them in smoothly
      const token = generateToken(user._id.toString(), user.role);
      setAuthCookie(res, token);
      const profile = await UserProfile.findOne({ user: user._id });

      res.status(200).json({
        success: true,
        message: "Your account is already verified.",
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          isVerified: true,
          profile: profile
            ? {
                firstName: profile.firstName,
                lastName: profile.lastName,
              }
            : null,
        },
      });

      return;
    }

    if (!user.verificationCode || user.verificationCode !== cleanCode) {
      res.status(400).json({
        success: false,
        message: "Invalid verification code. Please check your email and try again.",
      });

      return;
    }

    if (
      user.verificationCodeExpires &&
      user.verificationCodeExpires < new Date()
    ) {
      res.status(400).json({
        success: false,
        message:
          "This verification code has expired. Please request a new code.",
      });

      return;
    }

    // Activate user account
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    // Log the user in with JWT
    const token = generateToken(user._id.toString(), user.role);
    setAuthCookie(res, token);

    const profile = await UserProfile.findOne({ user: user._id });

    res.status(200).json({
      success: true,
      message: "Account verified successfully! Welcome to AURA Atelier.",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isVerified: true,
        profile: profile
          ? {
              firstName: profile.firstName,
              lastName: profile.lastName,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Verify email error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to verify email address",
    });
  }
};

/*
|--------------------------------------------------------------------------
| RESEND VERIFICATION CODE (OTP)
|--------------------------------------------------------------------------
*/

export const resendVerificationCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: "Email address is required.",
      });

      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+verificationCode +verificationCodeExpires"
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: "Account not found with this email address.",
      });

      return;
    }

    if (user.isVerified) {
      res.status(400).json({
        success: false,
        message: "This account has already been verified. You may sign in.",
      });

      return;
    }

    const profile = await UserProfile.findOne({ user: user._id });
    const firstName = profile?.firstName || "Valued Client";

    // Generate fresh 6-digit OTP
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);

    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationCodeExpires;
    await user.save();

    const emailResult = await sendVerificationCodeEmail(
      normalizedEmail,
      firstName,
      verificationCode
    );

    if (!emailResult.sent) {
      res.status(500).json({
        success: false,
        message:
          emailResult.error ||
          "Unable to deliver verification email. Please check your SMTP credentials in server/.env.",
      });

      return;
    }

    res.status(200).json({
      success: true,
      message:
        "A fresh 6-digit verification code has been dispatched to your email address.",
    });
  } catch (error) {
    console.error("Resend verification code error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to resend verification code",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE USER PROFILE & LOGIN CREDENTIALS
|--------------------------------------------------------------------------
| Permanently deletes the user's profile and login credentials from MongoDB.
| After this deletion, the email is completely freed up and can be re-registered.
|--------------------------------------------------------------------------
*/

export const deleteMyAccount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });

      return;
    }

    const userId = req.user.userId;

    const user = await User.findById(userId);

    if (!user) {
      clearAuthCookie(res);
      res.status(404).json({
        success: false,
        message: "User account not found in database.",
      });

      return;
    }

    if (user.role === "admin") {
      res.status(403).json({
        success: false,
        message: "Administrative accounts cannot be self-deleted.",
      });

      return;
    }

    // 1. Delete login credentials from database (User model)
    await User.findByIdAndDelete(userId);

    // 2. Delete user profile from database (UserProfile model)
    await UserProfile.deleteMany({ user: userId });

    // 3. Delete customer cart from database (Cart model)
    await Cart.deleteMany({ user: userId });

    // 4. Clear authentication cookie
    clearAuthCookie(res);

    res.status(200).json({
      success: true,
      message:
        "Your profile and login credentials have been permanently deleted from the database.",
    });
  } catch (error) {
    console.error("Delete user account error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete account",
    });
  }
};