import { apiRequest, queryClient } from "./queryClient";
import type { User, LoginData, SignupData } from "@shared/schema";
import { VITE_API_BASE_URL } from "./utils";

export interface AuthResponse {
  // user: User;
  access_token: string;
  username: string;
  role: string;
}
const BACKEND_URL = VITE_API_BASE_URL;
export class AuthService {
  static async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiRequest(
      "POST",
      `${BACKEND_URL}/api/auth/login`,
      data
    );

    const result = await response.json();

    const rtnData = result?.data;
    if (rtnData?.token) {
      TokenManager.setTokens(rtnData.token, rtnData.username, rtnData.role);
      return {
        role: rtnData?.role,
        username: rtnData?.username,
        access_token: rtnData?.token,
      };
    }
    throw new AuthError("Invalid login response", "INVALID_RESPONSE");
  }

  static async signup(data: SignupData): Promise<AuthResponse> {
    const response = await apiRequest(
      "POST",
      `${BACKEND_URL}/api/auth/register`,
      data
    );

    const result = await response.json();

    const rtnData = result?.data;

    if (rtnData?.token) {
      TokenManager.setTokens(rtnData.token, rtnData.username, rtnData.role);
      return {
        role: rtnData?.role,
        username: rtnData?.username,
        access_token: rtnData?.token,
      };
    }
    throw new AuthError("Invalid signup response", "INVALID_RESPONSE");
  }

  static async logout(): Promise<void> {
    // await apiRequest("POST", `${BACKEND_URL}/api/auth/logout`);

    TokenManager.clearTokens();
    queryClient.removeQueries({ queryKey: ["/api/auth/me"] });

    TokenManager.clearTokens();

    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  }

  static async getCurrentUser(): Promise<AuthResponse> {
    const response = await apiRequest("GET", `${BACKEND_URL}/api/auth/me`);
    const result = await response.json();
    return result.data;
  }

  static async getGoogleAuthUrl(): Promise<string> {
    // Backend is not using redirect_uri parameter correctly, so get URL as-is
    // The popup will handle the production redirect URL
    const response = await apiRequest(
      "GET",
      `${BACKEND_URL}/api/auth/google/generateAuthUrl`
    );
    const result = await response.json();

    // Handle different possible response structures
    const authUrl =
      result?.data?.authUrl ||
      result?.data?.url ||
      result?.authUrl ||
      result?.url;

    if (!authUrl) {
      console.error("No auth URL found in response:", result);
      throw new AuthError(
        "Failed to get Google authentication URL",
        "NO_AUTH_URL"
      );
    }

    return authUrl;
  }

  static async handleGoogleCallback(code: string): Promise<AuthResponse> {
    const response = await apiRequest(
      "POST",
      `${BACKEND_URL}/api/auth/google/callback`,
      { code }
    );
    const result = await response.json();
    const rtnData = result?.data;

    if (rtnData?.token) {
      TokenManager.setTokens(rtnData.token, rtnData.username, rtnData.role);
      return {
        role: rtnData?.role,
        username: rtnData?.username,
        access_token: rtnData?.token,
      };
    }
    throw new AuthError("Invalid Google auth response", "INVALID_RESPONSE");
  }

  static async handleGoogleDirectAuth(
    token: string,
    username: string,
    role: string
  ): Promise<AuthResponse> {
    // Handle direct authentication when token is already provided
    TokenManager.setTokens(token, username, role);
    return {
      role: role,
      username: username,
      access_token: token,
    };
  }

  // Role-based access control helpers
  static hasRole(user: User | null, roles: string[]): boolean {
    return user ? roles.includes(user.role) : false;
  }

  static isAdmin(user: User | null): boolean {
    return this.hasRole(user, ["admin"]);
  }
}

// Token management utilities
export class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = "access_token";

  static setTokens(accessToken: string, username: string, role: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem("username", username);
    localStorage.setItem("role", role);
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }
  static getUsername(): string | null {
    return localStorage.getItem("username");
  }
  static getRole(): string | null {
    return localStorage.getItem("role");
  }

  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
  }
}

// Authentication error handling
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = "AuthError";
  }
}

// HTTP interceptor for automatic token handling
export function createAuthInterceptor() {
  return {
    request: (config: RequestInit): RequestInit => {
      const token = TokenManager.getAccessToken();
      if (token) {
        return {
          ...config,
          headers: {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          },
        };
      }
      return config;
    },

    response: async (response: Response): Promise<Response> => {
      if (response.status === 401) {
        if (!TokenManager.getAccessToken()) {
          TokenManager.clearTokens();
          window.location.href = "/login";
        }
      }
      return response;
    },
  };
}
