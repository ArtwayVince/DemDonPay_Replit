import { 
  users, organizations, reports, messages, follows, notifications,
  type User, type InsertUser,
  type Organization, type InsertOrganization, type OrganizationWithStats,
  type Report, type InsertReport,
  type Message, type InsertMessage,
  type Follow, type InsertFollow,
  type Notification
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, sql, and, gte } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByPhone(phoneNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserOtp(phoneNumber: string, otpCode: string, otpExpiry: Date): Promise<void>;
  verifyUser(id: string): Promise<void>;
  
  // Organizations
  getOrganizations(filters?: {
    search?: string;
    type?: string;
    sector?: string;
    state?: string;
  }): Promise<OrganizationWithStats[]>;
  getOrganization(id: string): Promise<Organization | undefined>;
  getOrganizationBySlug(slug: string): Promise<Organization | undefined>;
  getOrganizationByName(name: string): Promise<Organization | undefined>;
  getOrganizationWithStats(id: string, userId?: string): Promise<OrganizationWithStats | undefined>;
  createOrganization(org: InsertOrganization): Promise<Organization>;
  getCommunityOrganizationsForModeration(): Promise<Organization[]>;
  updateCommunityOrganization(
    id: string,
    updates: Partial<Pick<Organization, "name" | "type" | "sector" | "state" | "isApproved" | "isHidden">>
  ): Promise<Organization | undefined>;
  
  // Reports
  createReport(report: InsertReport & { userId: string }): Promise<Report>;
  getReportsByOrganization(organizationId: string): Promise<Report[]>;
  getOrganizationStats(organizationId: string): Promise<{
    totalReports: number;
    percentagePaid: number;
    lastReportedAt: string | null;
  }>;
  
  // Messages
  createMessage(message: InsertMessage & { userId: string }): Promise<Message>;
  getMessagesByOrganization(organizationId: string, limit?: number): Promise<Message[]>;
  
  // Follows
  followOrganization(userId: string, organizationId: string): Promise<Follow>;
  unfollowOrganization(userId: string, organizationId: string): Promise<void>;
  getUserFollows(userId: string): Promise<OrganizationWithStats[]>;
  isFollowing(userId: string, organizationId: string): Promise<boolean>;
  
  // Notifications
  createNotification(userId: string, notification: Omit<Notification, 'id' | 'userId' | 'createdAt' | 'isRead'>): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationRead(notificationId: string): Promise<void>;
  markAllNotificationsRead(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByPhone(phoneNumber: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserOtp(phoneNumber: string, otpCode: string, otpExpiry: Date): Promise<void> {
    await db
      .update(users)
      .set({ otpCode, otpExpiry })
      .where(eq(users.phoneNumber, phoneNumber));
  }

  async verifyUser(id: string): Promise<void> {
    await db
      .update(users)
      .set({ isVerified: true, otpCode: null, otpExpiry: null })
      .where(eq(users.id, id));
  }

  // Organizations
  async getOrganizations(filters?: {
    search?: string;
    type?: string;
    sector?: string;
    state?: string;
  }): Promise<OrganizationWithStats[]> {
    const conditions = [eq(organizations.isHidden, false)];
    
    if (filters?.type) {
      conditions.push(eq(organizations.type, filters.type));
    }
    if (filters?.sector) {
      conditions.push(eq(organizations.sector, filters.sector));
    }
    if (filters?.state) {
      conditions.push(eq(organizations.state, filters.state));
    }
    
    let query = db
      .select({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
        type: organizations.type,
        sector: organizations.sector,
        state: organizations.state,
        logoUrl: organizations.logoUrl,
        isCustom: organizations.isCustom,
        isApproved: organizations.isApproved,
        isHidden: organizations.isHidden,
        createdAt: organizations.createdAt,
        totalReports: sql<number>`count(distinct ${reports.id})`,
        lastReportedAt: sql<string>`max(${reports.createdAt})`,
      })
      .from(organizations)
      .leftJoin(reports, eq(reports.organizationId, organizations.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(organizations.id)
      .orderBy(desc(sql`count(distinct ${reports.id})`));

    const orgs = await query;
    
    // Calculate percentage for each org based on reports in last 30 days
    const orgsWithPercentage = await Promise.all(
      orgs.map(async (org) => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const [recentStats] = await db
          .select({
            totalReports: sql<number>`count(*)`,
          })
          .from(reports)
          .where(
            and(
              eq(reports.organizationId, org.id),
              gte(reports.createdAt, thirtyDaysAgo)
            )
          );
        
        // Assume 70% threshold - if we have reports, calculate percentage
        const totalReports = Number(recentStats?.totalReports || 0);
        const percentagePaid = totalReports > 0 ? Math.min(100, totalReports * 10) : 0;
        
        return {
          ...org,
          totalReports: Number(org.totalReports),
          percentagePaid,
          lastReportedAt: org.lastReportedAt || null,
        };
      })
    );

    // Apply search filter in memory (for simplicity)
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      return orgsWithPercentage.filter(org =>
        org.name.toLowerCase().includes(searchLower) ||
        org.sector.toLowerCase().includes(searchLower) ||
        (org.state && org.state.toLowerCase().includes(searchLower))
      );
    }

    return orgsWithPercentage;
  }

  async getOrganization(id: string): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org || undefined;
  }

  async getOrganizationBySlug(slug: string): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.slug, slug));
    return org || undefined;
  }

  async getOrganizationByName(name: string): Promise<Organization | undefined> {
    const [org] = await db
      .select()
      .from(organizations)
      .where(sql`lower(${organizations.name}) = ${name.trim().toLowerCase()}`)
      .limit(1);
    return org || undefined;
  }

  async getOrganizationWithStats(id: string, userId?: string): Promise<OrganizationWithStats | undefined> {
    const org = await this.getOrganization(id);
    if (!org || org.isHidden) return undefined;

    const stats = await this.getOrganizationStats(id);
    
    let isFollowing = false;
    if (userId) {
      isFollowing = await this.isFollowing(userId, id);
    }

    return {
      ...org,
      ...stats,
      isFollowing,
    };
  }

  async createOrganization(insertOrg: InsertOrganization): Promise<Organization> {
    // Generate slug from name
    const baseSlug = insertOrg.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || "organization";
    let slug = baseSlug;
    let suffix = 2;
    while (await this.getOrganizationBySlug(slug)) {
      slug = `${baseSlug}-${suffix++}`;
    }
    
    const [org] = await db
      .insert(organizations)
      .values({
        ...insertOrg,
        slug,
        isCustom: true,
        isApproved: false,
      })
      .returning();
    return org;
  }

  async getCommunityOrganizationsForModeration(): Promise<Organization[]> {
    return db
      .select()
      .from(organizations)
      .where(eq(organizations.isCustom, true))
      .orderBy(asc(organizations.isApproved), asc(organizations.isHidden), desc(organizations.createdAt));
  }

  async updateCommunityOrganization(
    id: string,
    updates: Partial<Pick<Organization, "name" | "type" | "sector" | "state" | "isApproved" | "isHidden">>
  ): Promise<Organization | undefined> {
    const [current] = await db
      .select()
      .from(organizations)
      .where(and(eq(organizations.id, id), eq(organizations.isCustom, true)))
      .limit(1);
    if (!current) return undefined;

    const values: Partial<Organization> = { ...updates };
    if (updates.name && updates.name !== current.name) {
      const baseSlug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "organization";
      let slug = baseSlug;
      let suffix = 2;
      let existing = await this.getOrganizationBySlug(slug);
      while (existing && existing.id !== id) {
        slug = `${baseSlug}-${suffix++}`;
        existing = await this.getOrganizationBySlug(slug);
      }
      values.slug = slug;
    }

    const [updated] = await db
      .update(organizations)
      .set(values)
      .where(and(eq(organizations.id, id), eq(organizations.isCustom, true)))
      .returning();
    return updated;
  }

  // Reports
  async createReport(insertReport: InsertReport & { userId: string }): Promise<Report> {
    const datePaid = insertReport.datePaid instanceof Date
      ? insertReport.datePaid
      : new Date(insertReport.datePaid);
    if (Number.isNaN(datePaid.getTime())) {
      throw new Error("Invalid salary payment date");
    }

    const [report] = await db
      .insert(reports)
      .values({ ...insertReport, datePaid })
      .returning();
    
    // Check if we should trigger notifications
    const stats = await this.getOrganizationStats(insertReport.organizationId);
    if (stats.percentagePaid >= 70) {
      const org = await this.getOrganization(insertReport.organizationId);
      if (org) {
        // Get all followers and notify them
        const followers = await db
          .select({ userId: follows.userId })
          .from(follows)
          .where(eq(follows.organizationId, insertReport.organizationId));
        
        for (const follower of followers) {
          if (follower.userId !== insertReport.userId) {
            await this.createNotification(follower.userId, {
              organizationId: insertReport.organizationId,
              type: 'payment_alert',
              title: 'Salary Alert!',
              message: `Dem don pay for ${org.name}! ${Math.round(stats.percentagePaid)}% confirmed 🎉`,
            });
          }
        }
      }
    }
    
    return report;
  }

  async getReportsByOrganization(organizationId: string): Promise<Report[]> {
    return await db
      .select()
      .from(reports)
      .where(eq(reports.organizationId, organizationId))
      .orderBy(desc(reports.createdAt))
      .limit(50);
  }

  async getOrganizationStats(organizationId: string): Promise<{
    totalReports: number;
    percentagePaid: number;
    lastReportedAt: string | null;
  }> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [stats] = await db
      .select({
        totalReports: sql<number>`count(*)`,
        lastReportedAt: sql<string>`max(${reports.createdAt})`,
      })
      .from(reports)
      .where(
        and(
          eq(reports.organizationId, organizationId),
          gte(reports.createdAt, thirtyDaysAgo)
        )
      );

    const totalReports = Number(stats?.totalReports || 0);
    const percentagePaid = totalReports > 0 ? Math.min(100, totalReports * 10) : 0;

    return {
      totalReports,
      percentagePaid,
      lastReportedAt: stats?.lastReportedAt || null,
    };
  }

  // Messages
  async createMessage(insertMessage: InsertMessage & { userId: string }): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getMessagesByOrganization(organizationId: string, limit = 100): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.organizationId, organizationId))
      .orderBy(desc(messages.createdAt))
      .limit(limit);
  }

  // Follows
  async followOrganization(userId: string, organizationId: string): Promise<Follow> {
    const [follow] = await db
      .insert(follows)
      .values({ userId, organizationId })
      .returning();
    return follow;
  }

  async unfollowOrganization(userId: string, organizationId: string): Promise<void> {
    await db
      .delete(follows)
      .where(
        and(
          eq(follows.userId, userId),
          eq(follows.organizationId, organizationId)
        )
      );
  }

  async getUserFollows(userId: string): Promise<OrganizationWithStats[]> {
    const userFollows = await db
      .select({
        organization: organizations,
      })
      .from(follows)
      .innerJoin(organizations, eq(follows.organizationId, organizations.id))
      .where(and(eq(follows.userId, userId), eq(organizations.isHidden, false)));

    return Promise.all(userFollows.map(async ({ organization }) => ({
      ...organization,
      ...await this.getOrganizationStats(organization.id),
      isFollowing: true,
    })));
  }

  async isFollowing(userId: string, organizationId: string): Promise<boolean> {
    const [follow] = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.userId, userId),
          eq(follows.organizationId, organizationId)
        )
      );
    return !!follow;
  }

  // Notifications
  async createNotification(userId: string, notification: Omit<Notification, 'id' | 'userId' | 'createdAt' | 'isRead'>): Promise<Notification> {
    const [notif] = await db
      .insert(notifications)
      .values({
        userId,
        ...notification,
      })
      .returning();
    return notif;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }
}

export const storage = new DatabaseStorage();
