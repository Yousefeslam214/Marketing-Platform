import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthService, TokenManager } from "@/lib/auth";
import type { User, LoginData, SignupData } from "@shared/schema";
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: AuthService.getCurrentUser,
    enabled: !!TokenManager.getAccessToken(),
    retry: false,
  });

  useEffect(() => {
    // Check if user was previously authenticated
    if (TokenManager.getAccessToken()) {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
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
      TokenManager.setTokens(
        data.access_token,
        data.username ?? "",
        data.role ?? ""
      );
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

  // const loginWithGoogle = async () => {
  //   try {
  //     const authUrl = await AuthService.getGoogleAuthUrl();
  //     console.log("Redirecting to Google auth URL:", authUrl);

  //     if (!authUrl || authUrl === "undefined") {
  //       throw new Error("Invalid Google authentication URL received");
  //     }

  //     window.location.href = authUrl;
  // //       const redirectUri = `${window.location.origin}/google/callback`; // ✅ frontend callback route
  // // window.location.href = `${window.location.origin}/api/auth/google/login?redirect_uri=${encodeURIComponent(redirectUri)}`;

  //   } catch (error) {
  //     console.error("Google authentication error:", error);
  //     throw new Error(
  //       `Failed to initiate Google authentication: ${
  //         error instanceof Error ? error.message : "Unknown error"
  //       }`
  //     );
  //   }
  // };

  // const loginWithGoogle = async () => {
  //   try {
  //     // ✅ Hardcoded redirect URI for local development
  //     const redirectUri = "http://localhost:3000/google/callback";

  //     // ✅ Generate the Google login URL and include redirect_uri
  //     const authUrl = `${
  //       window.location.origin
  //     }/api/auth/google/login?redirect_uri=${encodeURIComponent(redirectUri)}`;

  //     console.log("Redirecting to Google auth URL:", authUrl);

  //     if (!authUrl || authUrl === "undefined") {
  //       throw new Error("Invalid Google authentication URL received");
  //     }

  //     // ✅ Redirect the user to start the OAuth flow
  //     window.location.href = authUrl;
  //     // res.redirect("/dashboard");

  //   } catch (error) {
  //     console.error("Google authentication error:", error);
  //     throw new Error(
  //       `Failed to initiate Google authentication: ${
  //         error instanceof Error ? error.message : "Unknown error"
  //       }`
  //     );
  //   }
  // };
  const loginWithGoogle = async () => {
    try {
      // Clean up any old auth sessions first
      const oldKeys = Object.keys(localStorage).filter(
        (key) =>
          key.startsWith("google_auth_") &&
          (key.endsWith("_pending") || !key.includes("_pending"))
      );
      console.log("Cleaning up old auth keys:", oldKeys);
      oldKeys.forEach((key) => localStorage.removeItem(key));

      // Get the Google auth URL from your backend
      const authUrl = await AuthService.getGoogleAuthUrl();
      console.log("🔗 Received Google auth URL:", authUrl);

      if (!authUrl || authUrl === "undefined") {
        throw new Error("Invalid Google authentication URL received");
      }

      console.log("🪟 Opening Google auth popup:", authUrl);

      // Since COOP is blocking popup communication, let's try a different approach
      // Open popup but rely solely on localStorage polling for communication
      // Redirect the user directly to the Google authentication URL (no popup)
      window.location.href = authUrl;
      // After successful authentication, the backend should redirect back to your app's callback route
      // Handle the callback in your frontend to complete the login process
      return;

     
     

      // Pure localStorage-based communication (no postMessage due to COOP)
      return new Promise<void>((resolve, reject) => {
        let authCompleted = false;
        let pollInterval: NodeJS.Timeout;
        let timeoutId: NodeJS.Timeout;

        // Generate a unique key for this auth session
        const authKey = `google_auth_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        console.log("🔑 Generated auth key:", authKey);

        // Store the auth key so popup can find it
        localStorage.setItem(`${authKey}_pending`, window.location.origin);
        console.log(
          "💾 Stored pending auth key in localStorage:",
          `${authKey}_pending`
        );
        console.log(
          "🗂️ Current localStorage google_auth keys:",
          Object.keys(localStorage).filter((k) => k.includes("google_auth"))
        );

        // Poll localStorage for auth result
        const pollForAuthResult = () => {
          const authResult = localStorage.getItem(authKey);
          const allKeys = Object.keys(localStorage).filter((key) =>
            key.includes("google_auth")
          );
          console.log(
            `🔍 [${new Date().toLocaleTimeString()}] Polling for auth result with key: ${authKey}`
          );
          console.log(`🗂️ All google_auth keys in localStorage:`, allKeys);
          console.log(`📄 Auth result:`, authResult ? "Found!" : "Not found");

          if (authResult) {
            try {
              const result = JSON.parse(authResult);
              console.log("✅ Auth result from localStorage:", result);

              localStorage.removeItem(authKey); // Clean up
              localStorage.removeItem(`${authKey}_pending`); // Clean up pending

              if (result.success && result.token) {
                authCompleted = true;
                console.log("Authentication successful, processing token...");

                AuthService.handleGoogleDirectAuth(
                  result.token,
                  result.username,
                  result.role
                ).then(() => {
                  queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
                  toast({
                    title: "Login successful",
                    description: `Welcome back, ${result.username}!`,
                  });
                  cleanup();
                  resolve();
                  setTimeout(() => {
                    window.location.href = "/dashboard";
                  }, 500);
                });
              } else if (result.error) {
                authCompleted = true;
                console.log("Authentication failed:", result.error);
                cleanup();
                reject(new Error(result.error));
              }
            } catch (err) {
              console.error(
                "Error parsing auth result from localStorage:",
                err
              );
            }
          }
        };

        // Cleanup function
        const cleanup = () => {
          if (pollInterval) clearInterval(pollInterval);
          if (timeoutId) clearTimeout(timeoutId);
          localStorage.removeItem(authKey);
          localStorage.removeItem(`${authKey}_pending`);
        };

        // Start polling for localStorage updates
        pollInterval = setInterval(pollForAuthResult, 1000);

        // Timeout after 5 minutes
        timeoutId = setTimeout(() => {
          if (!authCompleted) {
            cleanup();
            reject(new Error("Authentication timeout"));
          }
        }, 5 * 60 * 1000);
      });
    } catch (error: any) {
      console.error("Google authentication error:", error);
      toast({
        title: "Authentication failed",
        description: error.message || "Failed to authenticate with Google",
        variant: "destructive",
      });
      throw error;
    }
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
        loginWithGoogle,
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
