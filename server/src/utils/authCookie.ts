import type { Response } from "express";

export const AUTH_COOKIE_NAME = "accessToken";

const sevenDaysInMilliseconds =
  7 * 24 * 60 * 60 * 1000;

export const setAuthCookie = (
  res: Response,
  token: string
): void => {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,

    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: sevenDaysInMilliseconds,
    path: "/",
  });
};

export const clearAuthCookie = (
  res: Response
): void => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
};