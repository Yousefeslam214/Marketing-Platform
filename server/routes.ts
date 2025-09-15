import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import Stripe from "stripe";
import { storage } from "./storage";
import { 
  loginSchema, 
  signupSchema, 
  createAdSchema, 
  purchaseCreditsSchema,
  adminActionSchema,
  insertImpressionEventSchema,
  insertClickEventSchema 
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import crypto from "crypto";
import { randomUUID } from "crypto";

// Stripe setup (conditional initialization)
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-08-27.basil",
    })
  : null;

// Session middleware
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "fallback-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
});

// Auth middleware
function requireAuth(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).json({ message: "Authentication required" });
  }
}

function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: Function) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const user = req.user as any;
    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    next();
  };
}

// Passport configuration
passport.use(new LocalStrategy(
  { usernameField: "email" },
  async (email, password, done) => {
    try {
      const user = await storage.validateUser(email, password);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Invalid email or password" });
      }
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Utility functions
function createFallbackHash(ip: string, userAgent: string, adId: string): string {
  const salt = process.env.SESSION_SECRET || "fallback-salt";
  const timeWindow = Math.floor(Date.now() / (10 * 60 * 1000)); // 10-minute windows
  return crypto
    .createHash("sha256")
    .update(`${salt}${ip}${userAgent}${adId}${timeWindow}`)
    .digest("hex");
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware setup
  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());

  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = signupSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser({
        email: validatedData.email,
        username: validatedData.username,
        password: validatedData.password,
        role: "advertiser",
      });

      await storage.createAuditLog({
        userId: user.id,
        action: "signup",
        resourceType: "user",
        resourceId: user.id,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed after signup" });
        }
        res.json({ user: { ...user, password: undefined } });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    try {
      loginSchema.parse(req.body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
    }

    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Internal server error" });
      }
      if (!user) {
        return res.status(401).json({ message: info.message || "Invalid credentials" });
      }

      req.login(user, async (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }

        await storage.createAuditLog({
          userId: user.id,
          action: "login",
          resourceType: "user",
          resourceId: user.id,
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        });

        res.json({ user: { ...user, password: undefined } });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, (req, res) => {
    const user = req.user as any;
    res.json({ user: { ...user, password: undefined } });
  });

  // Ads routes
  app.get("/api/ads", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const ads = await storage.getAdsByUser(user.id);
      res.json(ads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ads" });
    }
  });

  app.get("/api/ads/:id", requireAuth, async (req, res) => {
    try {
      const ad = await storage.getAd(req.params.id);
      if (!ad) {
        return res.status(404).json({ message: "Ad not found" });
      }

      const user = req.user as any;
      if (ad.userId !== user.id && !["admin", "marketing"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(ad);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ad" });
    }
  });

  app.post("/api/ads", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const validatedData = createAdSchema.parse(req.body);

      const ad = await storage.createAd({
        ...validatedData,
        userId: user.id,
        status: "draft",
      });

      // Generate presigned URL for image upload (placeholder)
      const uploadInfo = {
        uploadUrl: `https://api.example.com/upload/${ad.id}`,
        fields: {},
      };

      await storage.createAuditLog({
        userId: user.id,
        action: "create_ad",
        resourceType: "ad",
        resourceId: ad.id,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.json({ ad, uploadInfo });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create ad" });
    }
  });

  app.put("/api/ads/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const ad = await storage.getAd(req.params.id);
      
      if (!ad) {
        return res.status(404).json({ message: "Ad not found" });
      }

      if (ad.userId !== user.id && !["admin", "marketing"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const validatedData = createAdSchema.partial().parse(req.body);
      const updatedAd = await storage.updateAd(req.params.id, validatedData);

      await storage.createAuditLog({
        userId: user.id,
        action: "update_ad",
        resourceType: "ad",
        resourceId: ad.id,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.json(updatedAd);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to update ad" });
    }
  });

  app.post("/api/ads/:id/purchase", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const validatedData = purchaseCreditsSchema.parse(req.body);
      const ad = await storage.getAd(req.params.id);

      if (!ad) {
        return res.status(404).json({ message: "Ad not found" });
      }

      if (ad.userId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Create purchase record
      const purchase = await storage.createPurchase({
        userId: user.id,
        adId: ad.id,
        amount: validatedData.amount.toString(),
        impressionsAllocated: validatedData.impressions,
        status: "pending",
      });

      // Create Stripe Checkout session (if Stripe is available)
      if (!stripe) {
        return res.status(503).json({ 
          message: "Payment processing is currently unavailable. Please try again later." 
        });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Ad Impressions for ${ad.titleEn}`,
                description: `${validatedData.impressions} impressions`,
              },
              unit_amount: Math.round(validatedData.amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.get("origin")}/dashboard?payment=success`,
        cancel_url: `${req.get("origin")}/billing?payment=cancelled`,
        metadata: {
          purchaseId: purchase.id,
          userId: user.id,
          adId: ad.id,
        },
      });

      await storage.updatePurchase(purchase.id, {
        stripeSessionId: session.id,
      });

      res.json({ sessionUrl: session.url });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create purchase" });
    }
  });

  app.get("/api/ads/:id/analytics", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const ad = await storage.getAd(req.params.id);

      if (!ad) {
        return res.status(404).json({ message: "Ad not found" });
      }

      if (ad.userId !== user.id && !["admin", "marketing"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { startDate, endDate } = req.query;
      const stats = await storage.getAggregatedStats(
        ad.id,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Events routes
  app.post("/api/events/impression", async (req, res) => {
    try {
      const validatedData = insertImpressionEventSchema.parse(req.body);
      
      // Check for duplicate by event_id
      const existing = await storage.getImpressionByEventId(validatedData.eventId);
      if (existing) {
        return res.json({ message: "Duplicate event", id: existing.id });
      }

      // Fallback deduplication
      const ip = req.ip || "";
      const userAgent = req.get("User-Agent") || "";
      const fallbackHash = createFallbackHash(ip, userAgent, validatedData.adId);

      const ipHash = crypto.createHash("sha256").update(ip).digest("hex");
      const uaHash = crypto.createHash("sha256").update(userAgent).digest("hex");

      const impression = await storage.recordImpression({
        ...validatedData,
        ipHash,
        userAgent: uaHash,
        fallbackHash,
      });

      // TODO: Enqueue background job for aggregation
      
      res.json({ id: impression.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to record impression" });
    }
  });

  app.post("/api/events/click", async (req, res) => {
    try {
      const validatedData = insertClickEventSchema.parse(req.body);
      
      const ip = req.ip || "";
      const userAgent = req.get("User-Agent") || "";
      const ipHash = crypto.createHash("sha256").update(ip).digest("hex");
      const uaHash = crypto.createHash("sha256").update(userAgent).digest("hex");

      const click = await storage.recordClick({
        ...validatedData,
        ipHash,
        userAgent: uaHash,
      });

      // TODO: Enqueue background job for aggregation
      
      res.json({ id: click.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to record click" });
    }
  });

  // Admin routes
  app.get("/api/admin/ads/pending", requireAuth, requireRole(["admin", "marketing"]), async (req, res) => {
    try {
      const ads = await storage.getPendingAds();
      res.json(ads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending ads" });
    }
  });

  app.post("/api/admin/ads/:id/approve", requireAuth, requireRole(["admin", "marketing"]), async (req, res) => {
    try {
      const user = req.user as any;
      const ad = await storage.approveAd(req.params.id, user.id);

      await storage.createAuditLog({
        userId: user.id,
        action: "approve_ad",
        resourceType: "ad",
        resourceId: ad.id,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.json(ad);
    } catch (error) {
      res.status(500).json({ message: "Failed to approve ad" });
    }
  });

  app.post("/api/admin/ads/:id/reject", requireAuth, requireRole(["admin", "marketing"]), async (req, res) => {
    try {
      const user = req.user as any;
      const { reason } = adminActionSchema.parse(req.body);
      
      if (!reason) {
        return res.status(400).json({ message: "Rejection reason is required" });
      }

      const ad = await storage.rejectAd(req.params.id, reason, user.id);

      await storage.createAuditLog({
        userId: user.id,
        action: "reject_ad",
        resourceType: "ad",
        resourceId: ad.id,
        details: { reason },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.json(ad);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to reject ad" });
    }
  });

  app.post("/api/admin/ads/:id/publish", requireAuth, requireRole(["admin", "marketing"]), async (req, res) => {
    try {
      const user = req.user as any;
      const ad = await storage.updateAd(req.params.id, { status: "published" });

      await storage.createAuditLog({
        userId: user.id,
        action: "publish_ad",
        resourceType: "ad",
        resourceId: ad.id,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      // TODO: Enqueue social publishing job

      res.json(ad);
    } catch (error) {
      res.status(500).json({ message: "Failed to publish ad" });
    }
  });

  // Stripe webhook
  app.post("/api/webhooks/stripe", async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ message: "Stripe not configured" });
    }

    const sig = req.headers["stripe-signature"];
    
    if (!sig) {
      return res.status(400).json({ message: "Missing stripe signature" });
    }

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ""
      );

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const { purchaseId, userId } = session.metadata || {};

        if (purchaseId) {
          await storage.updatePurchase(purchaseId, {
            status: "completed",
            stripePaymentIntentId: session.payment_intent as string,
          });

          // TODO: Allocate impression credits to user
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Stripe webhook error:", error);
      res.status(400).json({ message: "Webhook error" });
    }
  });

  // Dashboard metrics
  app.get("/api/dashboard/metrics", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const metrics = await storage.getDashboardMetrics(user.id);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
