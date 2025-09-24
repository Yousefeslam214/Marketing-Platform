// Simple test API for Vercel deployment
export default function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Basic health check
  if (req.url === "/api/health") {
    return res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
    });
  }

  // Simple login endpoint for testing
  if (req.url === "/api/auth/login" && req.method === "POST") {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Basic test credentials
    if (email === "test@example.com" && password === "testpassword") {
      return res.status(200).json({
        user: {
          id: "1",
          email: "test@example.com",
          username: "test",
          role: "advertiser",
        },
      });
    }

    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Default response
  res
    .status(404)
    .json({ message: "Endpoint not found", url: req.url, method: req.method });
}
