import { 
  users, 
  ads, 
  purchases, 
  impressionsEvents, 
  clicksEvents, 
  aggregatedStats, 
  auditLogs,
  type User, 
  type InsertUser,
  type Ad,
  type InsertAd,
  type Purchase,
  type InsertPurchase,
  type ImpressionEvent,
  type ClickEvent,
  type AggregatedStats,
  type AuditLog
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, count, sum } from "drizzle-orm";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  updateUserStripeInfo(id: string, customerId: string, subscriptionId?: string): Promise<User>;

  // Authentication
  validateUser(email: string, password: string): Promise<User | null>;
  hashPassword(password: string): Promise<string>;

  // Ads
  getAd(id: string): Promise<Ad | undefined>;
  getAdsByUser(userId: string): Promise<Ad[]>;
  getPendingAds(): Promise<Ad[]>;
  createAd(ad: InsertAd & { userId: string }): Promise<Ad>;
  updateAd(id: string, updates: Partial<Ad>): Promise<Ad>;
  approveAd(id: string, approvedBy: string): Promise<Ad>;
  rejectAd(id: string, reason: string, rejectedBy: string): Promise<Ad>;

  // Purchases
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  updatePurchase(id: string, updates: Partial<Purchase>): Promise<Purchase>;
  getPurchasesByUser(userId: string): Promise<Purchase[]>;

  // Events
  recordImpression(event: Omit<ImpressionEvent, "id" | "createdAt">): Promise<ImpressionEvent>;
  recordClick(event: Omit<ClickEvent, "id" | "createdAt">): Promise<ClickEvent>;
  getImpressionByEventId(eventId: string): Promise<ImpressionEvent | undefined>;

  // Analytics
  getAggregatedStats(adId: string, startDate?: Date, endDate?: Date): Promise<AggregatedStats[]>;
  updateAggregatedStats(adId: string, date: Date, impressions: number, clicks: number): Promise<void>;
  getDashboardMetrics(userId: string): Promise<{
    totalImpressions: number;
    totalClicks: number;
    ctr: number;
    creditsRemaining: number;
  }>;

  // Audit
  createAuditLog(log: Omit<AuditLog, "id" | "createdAt">): Promise<AuditLog>;
}

export class DatabaseStorage implements IStorage {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await this.hashPassword(insertUser.password);
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword,
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserStripeInfo(id: string, customerId: string, subscriptionId?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        stripeCustomerId: customerId,
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAd(id: string): Promise<Ad | undefined> {
    const [ad] = await db.select().from(ads).where(eq(ads.id, id));
    return ad;
  }

  async getAdsByUser(userId: string): Promise<Ad[]> {
    return db.select().from(ads).where(eq(ads.userId, userId)).orderBy(desc(ads.createdAt));
  }

  async getPendingAds(): Promise<Ad[]> {
    return db.select().from(ads).where(eq(ads.status, "pending")).orderBy(desc(ads.createdAt));
  }

  async createAd(adData: InsertAd & { userId: string }): Promise<Ad> {
    const [ad] = await db
      .insert(ads)
      .values({
        ...adData,
        publishToken: randomUUID(),
      })
      .returning();
    return ad;
  }

  async updateAd(id: string, updates: Partial<Ad>): Promise<Ad> {
    const [ad] = await db
      .update(ads)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(ads.id, id))
      .returning();
    return ad;
  }

  async approveAd(id: string, approvedBy: string): Promise<Ad> {
    const [ad] = await db
      .update(ads)
      .set({ 
        status: "approved",
        approvedBy,
        updatedAt: new Date() 
      })
      .where(eq(ads.id, id))
      .returning();
    return ad;
  }

  async rejectAd(id: string, reason: string, rejectedBy: string): Promise<Ad> {
    const [ad] = await db
      .update(ads)
      .set({ 
        status: "rejected",
        rejectionReason: reason,
        approvedBy: rejectedBy,
        updatedAt: new Date() 
      })
      .where(eq(ads.id, id))
      .returning();
    return ad;
  }

  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    const [newPurchase] = await db
      .insert(purchases)
      .values(purchase)
      .returning();
    return newPurchase;
  }

  async updatePurchase(id: string, updates: Partial<Purchase>): Promise<Purchase> {
    const [purchase] = await db
      .update(purchases)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(purchases.id, id))
      .returning();
    return purchase;
  }

  async getPurchasesByUser(userId: string): Promise<Purchase[]> {
    return db.select().from(purchases).where(eq(purchases.userId, userId)).orderBy(desc(purchases.createdAt));
  }

  async recordImpression(event: Omit<ImpressionEvent, "id" | "createdAt">): Promise<ImpressionEvent> {
    const [impression] = await db
      .insert(impressionsEvents)
      .values(event)
      .returning();
    return impression;
  }

  async recordClick(event: Omit<ClickEvent, "id" | "createdAt">): Promise<ClickEvent> {
    const [click] = await db
      .insert(clicksEvents)
      .values(event)
      .returning();
    return click;
  }

  async getImpressionByEventId(eventId: string): Promise<ImpressionEvent | undefined> {
    const [impression] = await db
      .select()
      .from(impressionsEvents)
      .where(eq(impressionsEvents.eventId, eventId));
    return impression;
  }

  async getAggregatedStats(adId: string, startDate?: Date, endDate?: Date): Promise<AggregatedStats[]> {
    let whereClause = eq(aggregatedStats.adId, adId);
    
    if (startDate && endDate) {
      whereClause = and(
        whereClause,
        gte(aggregatedStats.date, startDate),
        lte(aggregatedStats.date, endDate)
      );
    }
    
    return db.select().from(aggregatedStats).where(whereClause).orderBy(desc(aggregatedStats.date));
  }

  async updateAggregatedStats(adId: string, date: Date, impressions: number, clicks: number): Promise<void> {
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    
    await db
      .insert(aggregatedStats)
      .values({
        adId,
        date,
        impressions,
        clicks,
        ctr: ctr.toString(),
      })
      .onConflictDoUpdate({
        target: [aggregatedStats.adId, aggregatedStats.date],
        set: {
          impressions: impressions,
          clicks: clicks,
          ctr: ctr.toString(),
          updatedAt: new Date(),
        },
      });
  }

  async getDashboardMetrics(userId: string): Promise<{
    totalImpressions: number;
    totalClicks: number;
    ctr: number;
    creditsRemaining: number;
  }> {
    // Get user's ads
    const userAds = await this.getAdsByUser(userId);
    const adIds = userAds.map(ad => ad.id);

    if (adIds.length === 0) {
      const user = await this.getUser(userId);
      return {
        totalImpressions: 0,
        totalClicks: 0,
        ctr: 0,
        creditsRemaining: user?.freeViewsCredits || 0,
      };
    }

    // Get aggregated stats
    const stats = await db
      .select({
        totalImpressions: sum(aggregatedStats.impressions),
        totalClicks: sum(aggregatedStats.clicks),
      })
      .from(aggregatedStats)
      .where(eq(aggregatedStats.adId, adIds[0])); // Simplified for now

    const user = await this.getUser(userId);
    const totalImpressions = Number(stats[0]?.totalImpressions || 0);
    const totalClicks = Number(stats[0]?.totalClicks || 0);
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    return {
      totalImpressions,
      totalClicks,
      ctr: Math.round(ctr * 100) / 100,
      creditsRemaining: user?.freeViewsCredits || 0,
    };
  }

  async createAuditLog(log: Omit<AuditLog, "id" | "createdAt">): Promise<AuditLog> {
    const [auditLog] = await db
      .insert(auditLogs)
      .values(log)
      .returning();
    return auditLog;
  }
}

export const storage = new DatabaseStorage();
