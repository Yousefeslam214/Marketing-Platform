import { apiRequest } from "./queryClient";
import type { User, LoginData, SignupData } from "@shared/schema";

export interface AuthResponse {
  // user: User;
  access_token: string;
}
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.BACKEND_URL ||
  "https://marketing-platform-ten.vercel.app";

export class AuthService {
  static async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiRequest(
      "POST",
      `${BACKEND_URL}/api/auth/login`,
      data
    );
    const result = await response.json();
    if (result.data?.token) {
      TokenManager.setTokens(result.data.token);
      return {
        // user: result.data.user,
        access_token: result.data.token,
      };
    }
    throw new AuthError("Invalid login response", "INVALID_RESPONSE");
  }

  static async signup(data: SignupData): Promise<AuthResponse> {
    const response = await apiRequest(
      "POST",
      `${BACKEND_URL}/api/auth/signup`,
      data
    );
    return response.json();
  }

  static async logout(): Promise<void> {
    await apiRequest("POST", `${BACKEND_URL}/api/auth/logout`);
  }

  static async getCurrentUser(): Promise<AuthResponse> {
    const response = await apiRequest("GET", `${BACKEND_URL}/api/auth/me`);
    return response.json();
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

  static setTokens(accessToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
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
