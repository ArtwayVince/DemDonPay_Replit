import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - phone number based authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: text("phone_number").notNull().unique(),
  displayName: text("display_name"),
  isVerified: boolean("is_verified").notNull().default(false),
  isModerator: boolean("is_moderator").notNull().default(false),
  otpCode: text("otp_code"), // Temporary OTP storage
  otpExpiry: timestamp("otp_expiry"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Organizations table - pre-seeded Nigerian companies and government bodies
export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  type: text("type").notNull(), // "government" | "private"
  sector: text("sector").notNull(), // "banking" | "telecom" | "government" | "education" | "healthcare" | "oil-gas" | "other"
  state: text("state"), // Nigerian state or "Federal"
  logoUrl: text("logo_url"),
  isCustom: boolean("is_custom").notNull().default(false), // User-submitted org
  isApproved: boolean("is_approved").notNull().default(true), // For custom orgs
  isHidden: boolean("is_hidden").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Salary Reports
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  datePaid: timestamp("date_paid").notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }), // Optional amount
  proofUrl: text("proof_url"), // Optional screenshot proof
  isAnonymous: boolean("is_anonymous").notNull().default(true),
  reporterRole: text("reporter_role").notNull().default("employee"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Chat Messages - organization-specific chat rooms
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Follows - users following organizations
export const follows = pgTable("follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  organizationId: varchar("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // "payment_alert" | "custom_org_approved" | "system"
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  reports: many(reports),
  messages: many(messages),
  follows: many(follows),
  notifications: many(notifications),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  reports: many(reports),
  messages: many(messages),
  follows: many(follows),
  notifications: many(notifications),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  user: one(users, {
    fields: [reports.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [reports.organizationId],
    references: [organizations.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [messages.organizationId],
    references: [organizations.id],
  }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  user: one(users, {
    fields: [follows.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [follows.organizationId],
    references: [organizations.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [notifications.organizationId],
    references: [organizations.id],
  }),
}));

// Insert schemas and types
export const insertUserSchema = createInsertSchema(users).pick({
  phoneNumber: true,
  displayName: true,
});

export const insertOrganizationSchema = createInsertSchema(organizations).pick({
  name: true,
  type: true,
  sector: true,
  state: true,
});

export const moderateOrganizationSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("save"),
    name: z.string().trim().min(1).max(150),
    type: z.enum(["government", "private"]),
    sector: z.enum(["banking", "telecom", "government", "education", "healthcare", "oil-gas", "other"]),
    state: z.string().trim().max(100).nullable(),
  }),
  z.object({
    action: z.literal("approve"),
    name: z.string().trim().min(1).max(150),
    type: z.enum(["government", "private"]),
    sector: z.enum(["banking", "telecom", "government", "education", "healthcare", "oil-gas", "other"]),
    state: z.string().trim().max(100).nullable(),
  }),
  z.object({ action: z.literal("hide") }),
  z.object({ action: z.literal("restore") }),
]);

export const insertReportSchema = createInsertSchema(reports).pick({
  organizationId: true,
  datePaid: true,
  amount: true,
  proofUrl: true,
  isAnonymous: true,
  reporterRole: true,
}).extend({
  datePaid: z.string().or(z.date()),
  reporterRole: z.enum(["employee", "representative"]).default("employee"),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  organizationId: true,
  content: true,
});

export const insertFollowSchema = createInsertSchema(follows).pick({
  organizationId: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Follow = typeof follows.$inferSelect;
export type InsertFollow = z.infer<typeof insertFollowSchema>;

export type Notification = typeof notifications.$inferSelect;

// Organization with stats (for API responses)
export type OrganizationWithStats = Organization & {
  totalReports: number;
  percentagePaid: number;
  lastReportedAt: string | null;
  isFollowing?: boolean;
};
