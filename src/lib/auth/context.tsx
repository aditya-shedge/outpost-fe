"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { User } from "@/lib/api/types";
import { hasTokens, clearTokens } from "./storage";
import { AuthContextType, AuthState } from "./types";
import { ApiClientError } from "@/lib/api/client";

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isVerified: false,
  isOnboarded: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);
  const router = useRouter();
  const hasInitialized = useRef(false);

  const updateUserState = useCallback((user: User | null) => {
    setState({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      isVerified: user?.emailVerified ?? false,
      isOnboarded: user?.onboarded ?? false,
    });
  }, []);

  const refreshUser = useCallback(async () => {
    if (!hasTokens()) {
      setState({ ...initialState, isLoading: false });
      return;
    }

    try {
      const user = await authApi.getMe();
      updateUserState(user);
    } catch (error) {
      // If we get an auth error, clear tokens and reset state
      if (error instanceof ApiClientError && error.status === 401) {
        clearTokens();
      }
      setState({ ...initialState, isLoading: false });
    }
  }, [updateUserState]);

  // Check auth status on mount - uses ref to track if we've initialized
  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      setState((prev) => ({ ...prev, isLoading: true }));
      try {
        await authApi.login({ email, password });
        const user = await authApi.getMe();
        updateUserState(user);

        // Redirect based on user state
        if (!user.emailVerified) {
          router.push("/verify-email");
        } else if (!user.onboarded) {
          router.push("/onboarding");
        } else if (user.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/discover");
        }
      } catch (error) {
        setState((prev) => ({ ...prev, isLoading: false }));
        throw error;
      }
    },
    [router, updateUserState]
  );

  const signup = useCallback(
    async (email: string, password: string) => {
      setState((prev) => ({ ...prev, isLoading: true }));
      try {
        await authApi.signup({ email, password });
        // Don't call getMe() - user needs to verify email first
        // Just set minimal state and redirect to verify-email
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isAuthenticated: true,
          isVerified: false,
          isOnboarded: false,
          user: { email } as User,
        }));
        router.push("/verify-email");
      } catch (error) {
        setState((prev) => ({ ...prev, isLoading: false }));
        throw error;
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    authApi.logout();
    setState({ ...initialState, isLoading: false });
    router.push("/login");
  }, [router]);

  const value: AuthContextType = {
    ...state,
    login,
    signup,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
