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

  resendVerification: (
    email: string
  ) => Promise<ResendVerificationResponse>;

  logout: () => Promise<void>;

  deleteAccount: () => Promise<void>;

  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  /*
   * Restore locally cached authentication data.
   */
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser =
        localStorage.getItem("aura_user");

      const token =
        localStorage.getItem("aura_token");

      if (savedUser && token) {
        return JSON.parse(savedUser) as User;
      }
    } catch (error) {
      console.error(
        "Failed to restore cached user:",
        error
      );

      localStorage.removeItem("aura_user");
      localStorage.removeItem("aura_token");
    }

    return null;
  });

  const [loading, setLoading] =
    useState<boolean>(true);

  /*
   * Refresh currently authenticated user.
   *
   * This function remains available through useAuth()
   * so other components can manually refresh user data.
   */
  const refreshUser = useCallback(
    async (): Promise<void> => {
      try {
        const data = await authService.getMe();

        if (data.success && data.user) {
          setUser(data.user);

          localStorage.setItem(
            "aura_user",
            JSON.stringify(data.user)
          );
        } else {
          setUser(null);

          localStorage.removeItem(
            "aura_token"
          );

          localStorage.removeItem(
            "aura_user"
          );
        }
      } catch (error) {
        console.error(
          "Failed to refresh user:",
          error
        );

        setUser(null);

        localStorage.removeItem(
          "aura_token"
        );

        localStorage.removeItem(
          "aura_user"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /*
   * Initial authentication verification.
   *
   * Do not synchronously call refreshUser() from
   * this effect because the current React lint rule
   * traces its state updates back into the effect.
   */
  useEffect(() => {
    let cancelled = false;

    const initializeAuth =
      async (): Promise<void> => {
        try {
          const data =
            await authService.getMe();

          if (cancelled) {
            return;
          }

          if (data.success && data.user) {
            setUser(data.user);

            localStorage.setItem(
              "aura_user",
              JSON.stringify(data.user)
            );
          } else {
            setUser(null);

            localStorage.removeItem(
              "aura_token"
            );

            localStorage.removeItem(
              "aura_user"
            );
          }
        } catch (error) {
          if (cancelled) {
            return;
          }

          console.error(
            "Initial authentication check failed:",
            error
          );

          setUser(null);

          localStorage.removeItem(
            "aura_token"
          );

          localStorage.removeItem(
            "aura_user"
          );
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    void initializeAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Login
   */
  const login = async (
    credentials: LoginCredentials
  ): Promise<User> => {
    const data =
      await authService.login(credentials);

    if (!data.user) {
      throw new Error(
        data.message ||
          "Failed to log in"
      );
    }

    if (data.token) {
      localStorage.setItem(
        "aura_token",
        data.token
      );
    }

    setUser(data.user);

    localStorage.setItem(
      "aura_user",
      JSON.stringify(data.user)
    );

    return data.user;
  };

  /*
   * Register
   */
  const register = async (
    data: RegisterData
  ): Promise<RegisterResponse> => {
    return authService.register(data);
  };

  /*
   * Verify email / OTP
   */
  const verifyEmail = async (
    email: string,
    code: string
  ): Promise<User> => {
    const response =
      await authService.verifyEmail(
        email,
        code
      );

    if (!response.user) {
      throw new Error(
        response.message ||
          "Email verification failed"
      );
    }

    if (response.token) {
      localStorage.setItem(
        "aura_token",
        response.token
      );
    }

    setUser(response.user);

    localStorage.setItem(
      "aura_user",
      JSON.stringify(response.user)
    );

    return response.user;
  };

  /*
   * Resend verification code
   */
  const resendVerification = async (
    email: string
  ): Promise<ResendVerificationResponse> => {
    return authService.resendVerification(
      email
    );
  };

  /*
   * Logout
   */
  const logout =
    async (): Promise<void> => {
      try {
        await authService.logout();
      } catch (error) {
        console.error(
          "Logout request failed:",
          error
        );
      } finally {
        localStorage.removeItem(
          "aura_token"
        );

        localStorage.removeItem(
          "aura_user"
        );

        setUser(null);
      }
    };

  /*
   * Delete Account
   */
  const deleteAccount =
    async (): Promise<void> => {
      try {
        await authService.deleteAccount();
      } finally {
        localStorage.removeItem(
          "aura_token"
        );

        localStorage.removeItem(
          "aura_user"
        );

        setUser(null);
      }
    };

  /*
   * Admin role check
   */
  const isAdmin =
    user?.role === "admin";

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

/*
 * Keep this hook in the same file without
 * changing the rest of your project imports.
 *
 * This disables only the Vite Fast Refresh
 * warning for this hook export.
 */

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth =
  (): AuthContextType => {
    const context =
      useContext(AuthContext);

    if (!context) {
      throw new Error(
        "useAuth must be used within an AuthProvider"
      );
    }

    return context;
  };

export default AuthContext;