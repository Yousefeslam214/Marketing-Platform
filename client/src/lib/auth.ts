import { apiRequest } from "./queryClient";
import type { User, LoginData, SignupData } from "@shared/schema";

export interface AuthResponse {
  user: User;
}

export class AuthService {
  static async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/auth/login", data);
    return response.json();
  }

  static async signup(data: SignupData): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/auth/signup", data);
    return response.json();
  }

  static async logout(): Promise<void> {
    await apiRequest("POST", "/api/auth/logout");
  }

  static async getCurrentUser(): Promise<AuthResponse> {
    const response = await apiRequest("GET", "/api/auth/me");
    return response.json();
  }

  static async refreshToken(): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/auth/refresh");
    return response.json();
  }

  // Role-based access control helpers
  static hasRole(user: User | null, roles: string[]): boolean {
    return user ? roles.includes(user.role) : false;
  }

  static isAdmin(user: User | null): boolean {
    return this.hasRole(user, ["admin"]);
  }

  static isMarketing(user: User | null): boolean {
    return this.hasRole(user, ["marketing", "admin"]);
  }

  static isAdvertiser(user: User | null): boolean {
    return this.hasRole(user, ["advertiser"]);
  }

  static canManageAds(user: User | null): boolean {
    return this.hasRole(user, ["admin", "marketing"]);
  }

  static canViewAnalytics(user: User | null, adUserId?: string): boolean {
    if (this.hasRole(user, ["admin", "marketing"])) {
      return true;
    }
    return user?.id === adUserId;
  }
}

// Token management utilities
export class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = "access_token";
  private static readonly REFRESH_TOKEN_KEY = "refresh_token";

  static setTokens(accessToken: string, refreshToken?: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }
}

// Session management
export class SessionManager {
  private static readonly SESSION_KEY = "user_session";
  private static readonly EXPIRY_KEY = "session_expiry";

  static setSession(user: User, expiryMinutes: number = 1440): void {
    const expiry = Date.now() + (expiryMinutes * 60 * 1000);
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
    localStorage.setItem(this.EXPIRY_KEY, expiry.toString());
  }

  static getSession(): User | null {
    const session = localStorage.getItem(this.SESSION_KEY);
    const expiry = localStorage.getItem(this.EXPIRY_KEY);

    if (!session || !expiry) {
      return null;
    }

    if (Date.now() > parseInt(expiry)) {
      this.clearSession();
      return null;
    }

    try {
      return JSON.parse(session);
    } catch (error) {
      this.clearSession();
      return null;
    }
  }

  static clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.EXPIRY_KEY);
  }

  static isSessionActive(): boolean {
    const expiry = localStorage.getItem(this.EXPIRY_KEY);
    return expiry ? Date.now() < parseInt(expiry) : false;
  }

  static extendSession(minutes: number = 1440): void {
    const expiry = Date.now() + (minutes * 60 * 1000);
    localStorage.setItem(this.EXPIRY_KEY, expiry.toString());
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
      if (token && !TokenManager.isTokenExpired(token)) {
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
        const refreshToken = TokenManager.getRefreshToken();
        if (refreshToken && !TokenManager.isTokenExpired(refreshToken)) {
          try {
            const refreshResponse = await AuthService.refreshToken();
            // Retry original request with new token
            // This would need to be implemented based on your retry logic
          } catch (error) {
            TokenManager.clearTokens();
            SessionManager.clearSession();
            window.location.href = "/login";
          }
        } else {
          TokenManager.clearTokens();
          SessionManager.clearSession();
          window.location.href = "/login";
        }
      }
      return response;
    },
  };
}
