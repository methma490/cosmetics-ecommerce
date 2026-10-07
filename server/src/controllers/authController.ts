import type { Request, Response } from "express";
import bcrypt from "bcryptjs";

import User from "../models/user.js";
import UserProfile from "../models/userProfile.js";

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
    | Check email
    |--------------------------------------------------------------------------
    */

    const existingUser = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    // If an existing unverified account is found, refresh OTP and allow them to verify
    if (existingUser) {
      if (existingUser.isVerified === false) {
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);

        existingUser.password = hashedPassword;
        existingUser.verificationCode = verificationCode;
        existingUser.verificationCodeExpires = verificationCodeExpires;
        await existingUser.save();

        await UserProfile.findOneAndUpdate(
          { user: existingUser._id },
          { firstName: cleanFirstName, lastName: cleanLastName },
          { upsert: true }
        );

        await sendVerificationCodeEmail(normalizedEmail, cleanFirstName, verificationCode);

        res.status(200).json({
          success: true,
          requiresVerification: true,
          email: existingUser.email,
          message: "An unverified account with this email was found. A fresh 6-digit verification code has been dispatched.",
          devCode: process.env.NODE_ENV !== "production" ? verificationCode : undefined,
        });

        return;
      }

      res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });

      return;
    }

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

    await sendVerificationCodeEmail(
      normalizedEmail,
      cleanFirstName,
      verificationCode
    );

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
        "Account created! Please enter the 6-digit verification code sent to your email to activate your account.",
      devCode:
        process.env.NODE_ENV !== "production"
          ? verificationCode
          : undefined,
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
      await sendVerificationCodeEmail(
        user.email,
        profile?.firstName || "Valued Client",
        verificationCode
      );

      res.status(403).json({
        success: false,
        requiresVerification: true,
        email: user.email,
        message:
          "Your email address is not verified yet. We have sent a 6-digit verification code to your inbox.",
        devCode:
          process.env.NODE_ENV !== "production"
            ? verificationCode
            : undefined,
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

    await sendVerificationCodeEmail(
      normalizedEmail,
      firstName,
      verificationCode
    );

    res.status(200).json({
      success: true,
      message: "A fresh 6-digit verification code has been dispatched to your email.",
      devCode:
        process.env.NODE_ENV !== "production"
          ? verificationCode
          : undefined,
    });
  } catch (error) {
    console.error("Resend verification code error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to resend verification code",
    });
  }
};