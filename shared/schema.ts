import { pgTable, text, serial, integer, boolean, timestamp, foreignKey, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified"),
  image: text("image"),
  zip: text("zip"),
  about: text("about"),
  productsGrown: text("products_grown"),
  authType: text("auth_type").notNull(), // "google", "facebook", etc.
  authId: text("auth_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Listing model
export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(), // "Fruit", "Vegetable", "Eggs", etc.
  description: text("description"),
  price: integer("price").notNull(), // in cents
  unit: text("unit").notNull(), // "item" or "pound"
  quantity: integer("quantity").notNull(),
  pickAndPack: boolean("pick_and_pack").default(false),
  imageUrl: text("image_url"),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Order model
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull().references(() => listings.id),
  buyerId: integer("buyer_id").notNull().references(() => users.id),
  sellerId: integer("seller_id").notNull().references(() => users.id),
  quantity: integer("quantity").notNull(),
  totalPrice: integer("total_price").notNull(), // in cents
  stripeSessionId: text("stripe_session_id"),
  status: text("status").notNull(), // "pending", "paid", "completed"
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Review model
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  imageUrl: text("image_url"),
  orderId: integer("order_id").notNull().references(() => orders.id),
  reviewerId: integer("reviewer_id").notNull().references(() => users.id),
  sellerId: integer("seller_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

export const insertListingSchema = createInsertSchema(listings).omit({
  id: true,
  userId: true,
  createdAt: true
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true
});

// Enhanced seller profiles table
export const sellerProfiles = pgTable("seller_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  farmName: text("farm_name"),
  bio: text("bio"),
  address: text("address"),
  locationVisibility: text("location_visibility").default("city"), // full, area, city
  phone: text("phone"),
  email: text("email"),
  contactVisibility: text("contact_visibility").default("email"), // phone, email, both
  operationalHours: json("operational_hours"), // JSON structure for hours/days
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Profile media table for photos and videos
export const profileMedia = pgTable("profile_media", {
  id: serial("id").primaryKey(),
  sellerProfileId: integer("seller_profile_id").notNull().references(() => sellerProfiles.id),
  mediaType: text("media_type").notNull(), // photo, video
  url: text("url").notNull(),
  caption: text("caption"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Farm spaces available for rent/sharing
export const farmSpaces = pgTable("farm_spaces", {
  id: serial("id").primaryKey(),
  sellerProfileId: integer("seller_profile_id").notNull().references(() => sellerProfiles.id),
  title: text("title"),
  description: text("description"),
  sizeSqft: integer("size_sqft"),
  pricePerMonth: integer("price_per_month"),
  soilType: text("soil_type"),
  lightConditions: text("light_conditions"),
  waterAccess: boolean("water_access"),
  greenhouseAccess: boolean("greenhouse_access"),
  toolStorage: boolean("tool_storage"),
  location: text("location"),
  availableFrom: timestamp("available_from"),
  availableUntil: timestamp("available_until"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Messages table for user communication
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  recipientId: integer("recipient_id").notNull().references(() => users.id),
  farmSpaceId: integer("farm_space_id").references(() => farmSpaces.id),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Create insert schemas for new tables
export const insertSellerProfileSchema = createInsertSchema(sellerProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertProfileMediaSchema = createInsertSchema(profileMedia).omit({
  id: true,
  createdAt: true
});

export const insertFarmSpaceSchema = createInsertSchema(farmSpaces).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  isRead: true
});

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Listing = typeof listings.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type SellerProfile = typeof sellerProfiles.$inferSelect;
export type InsertSellerProfile = z.infer<typeof insertSellerProfileSchema>;

export type ProfileMedia = typeof profileMedia.$inferSelect;
export type InsertProfileMedia = z.infer<typeof insertProfileMediaSchema>;

export type FarmSpace = typeof farmSpaces.$inferSelect;
export type InsertFarmSpace = z.infer<typeof insertFarmSpaceSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
