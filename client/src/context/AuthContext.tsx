import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import authService from "../services/authService";
import type {
  User,
  LoginCredentials,
  RegisterData,
  RegisterResponse,
  ResendVerificationResponse,
} from "../types/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (data: RegisterData) => Promise<RegisterResponse>;
  verifyEmail: (email: string, code: string) => Promise<User>;
  resendVerification: (email: string) => Promise<ResendVerificationResponse>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem("aura_user");
      const token = localStorage.getItem("aura_token");
      if (savedUser && token) {
        return JSON.parse(savedUser) as User;
      }
    } catch {
      // ignore parse errors
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      const data = await authService.getMe();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem("aura_user", JSON.stringify(data.user));
      } else {
        setUser(null);
        localStorage.removeItem("aura_token");
        localStorage.removeItem("aura_user");
      }
    } catch {
      setUser(null);
      localStorage.removeItem("aura_token");
      localStorage.removeItem("aura_user");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    const data = await authService.login(credentials);
    if (!data.user) {
      throw new Error(data.message || "Failed to log in");
    }
    if (data.token) {
      localStorage.setItem("aura_token", data.token);
    }
    setUser(data.user);
    localStorage.setItem("aura_user", JSON.stringify(data.user));
    return data.user;
  };

  const register = async (data: RegisterData): Promise<RegisterResponse> => {
    return await authService.register(data);
  };

  const verifyEmail = async (email: string, code: string): Promise<User> => {
    const response = await authService.verifyEmail(email, code);
    if (response.token) {
      localStorage.setItem("aura_token", response.token);
    }
    setUser(response.user);
    localStorage.setItem("aura_user", JSON.stringify(response.user));
    return response.user;
  };

  const resendVerification = async (
    email: string
  ): Promise<ResendVerificationResponse> => {
    return await authService.resendVerification(email);
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem("aura_token");
      localStorage.removeItem("aura_user");
      setUser(null);
    }
  };

  const deleteAccount = async (): Promise<void> => {
    try {
      await authService.deleteAccount();
    } finally {
      localStorage.removeItem("aura_token");
      localStorage.removeItem("aura_user");
      setUser(null);
    }
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        login,
        register,
        verifyEmail,
        resendVerification,
        logout,
        deleteAccount,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
