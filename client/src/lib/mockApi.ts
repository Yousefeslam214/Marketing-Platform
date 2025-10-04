// Mock backend responses for development
const MOCK_USER = {
  id: "mock-user-123",
  username: "testuser",
  email: "test@example.com",
  role: "advertiser",
};

const MOCK_RESPONSES: Record<string, any> = {
  "/api/auth/login": {
    user: MOCK_USER,
  },
  "/api/auth/signup": {
    user: MOCK_USER,
  },
  "/api/auth/login": {
    user: MOCK_USER,
  },
  "/api/dashboard/metrics": {
    totalImpressions: 15420,
    totalClicks: 892,
    ctr: 5.78,
    creditsRemaining: 8500,
  },
  "/api/ads": [],
  "/api/all/ads": [],
  "/api/admin/ads/pending": [],
};

export class MockApiService {
  static async mockRequest(
    method: string,
    url: string,
    data?: any
  ): Promise<any> {
    // Extract the path from the URL
    const urlObj = new URL(url, window.location.origin);
    const path = urlObj.pathname;

    console.log(`🔧 Mock API: ${method} ${path}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (MOCK_RESPONSES[path]) {
      return {
        ok: true,
        status: 200,
        json: async () => MOCK_RESPONSES[path],
      };
    }

    // Default success response
    return {
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    };
  }
}
