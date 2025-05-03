import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model - for authentication and user management
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("employee"), // "employee", "admin", "manager"
  profileImage: text("profile_image"),
  active: boolean("active").default(true),
});

// Worksites - locations where employees work
export const worksites = pgTable("worksites", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  radius: integer("radius").notNull().default(100), // geofence radius in meters
  active: boolean("active").default(true),
});

// Check-ins - record of an employee checking in at a location
export const checkins = pgTable("checkins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  worksiteId: integer("worksite_id").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  verificationImageId: integer("verification_image_id"),
  status: text("status").notNull().default("pending"), // "pending", "verified", "rejected"
  notes: text("notes"),
  isOnsite: boolean("is_onsite").notNull().default(false),
});

// VerificationImages - images captured for verification
export const verificationImages = pgTable("verification_images", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  worksiteId: integer("worksite_id").notNull(),
  imageData: text("image_data").notNull(), // Base64 encoded image data
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Insert schemas using drizzle-zod
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertWorksiteSchema = createInsertSchema(worksites).omit({
  id: true,
});

export const insertCheckinSchema = createInsertSchema(checkins).omit({
  id: true,
  timestamp: true,
});

export const insertVerificationImageSchema = createInsertSchema(verificationImages).omit({
  id: true,
  timestamp: true,
});

// Types for database operations
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Worksite = typeof worksites.$inferSelect;
export type InsertWorksite = z.infer<typeof insertWorksiteSchema>;

export type Checkin = typeof checkins.$inferSelect;
export type InsertCheckin = z.infer<typeof insertCheckinSchema>;

export type VerificationImage = typeof verificationImages.$inferSelect;
export type InsertVerificationImage = z.infer<typeof insertVerificationImageSchema>;

// Custom schemas for API operations
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const locationCheckSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  worksiteId: z.number(),
});

export const checkInSchema = z.object({
  userId: z.number(),
  worksiteId: z.number(),
  latitude: z.number(),
  longitude: z.number(),
  imageData: z.string().optional(),
});

export type LoginCredentials = z.infer<typeof loginSchema>;
export type LocationCheck = z.infer<typeof locationCheckSchema>;
export type CheckInRequest = z.infer<typeof checkInSchema>;
