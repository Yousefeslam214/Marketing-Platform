import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthService, TokenManager } from "@/lib/auth";
import type { User, LoginData, SignupData } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/login"],
    queryFn: AuthService.getCurrentUser,
    enabled: !!TokenManager.getAccessToken(),
    retry: false,
  });

  useEffect(() => {
    // Check if user was previously authenticated
    if (TokenManager.getAccessToken()) {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/login"] });
    }
  }, [queryClient]);

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      return await AuthService.login(data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/login"], data);

      // localStorage.setItem("access_token", data.access_token);

      TokenManager.setTokens(
        data.access_token ?? "",
        data.username ?? "",
        data.role ?? ""
      );
      // TokenManager.setTokens(data.role);
      // TokenManager.setTokens(data.username);

    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupData) => {
      return await AuthService.signup(data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/login"], data);
      // localStorage.setItem("access_token", data.access_token);
      TokenManager.setTokens(data.access_token, data.username ?? "", data.role ?? "");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await AuthService.logout();
    },
  });

  const login = async (data: LoginData) => {
    await loginMutation.mutateAsync(data);
  };

  const signup = async (data: SignupData) => {
    await signupMutation.mutateAsync(data);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem("access_token")
  );

  return (
    <AuthContext.Provider
      value={{
        user: (user as any)?.user || null,
        accessToken: TokenManager.getAccessToken(),
        login,
        signup,
        logout,
        isLoading:
          isLoading ||
          loginMutation.isPending ||
          signupMutation.isPending ||
          logoutMutation.isPending,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
