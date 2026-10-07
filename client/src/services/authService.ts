import api from "./api";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  RegisterResponse,
  VerifyEmailResponse,
  ResendVerificationResponse,
} from "../types/auth";

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>("/auth/register", data);
    return response.data;
  },

  verifyEmail: async (
    email: string,
    code: string
  ): Promise<VerifyEmailResponse> => {
    const response = await api.post<VerifyEmailResponse>("/auth/verify-email", {
      email,
      code,
    });
    return response.data;
  },

  resendVerification: async (
    email: string
  ): Promise<ResendVerificationResponse> => {
    const response = await api.post<ResendVerificationResponse>(
      "/auth/resend-verification",
      { email }
    );
    return response.data;
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>(
      "/auth/logout"
    );
    return response.data;
  },

  getMe: async (): Promise<AuthResponse> => {
    const response = await api.get<AuthResponse>("/auth/me");
    return response.data;
  },

  deleteAccount: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(
      "/auth/profile"
    );
    return response.data;
  },
};

export default authService;
