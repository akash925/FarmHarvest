import { pgTable, text, serial, integer, boolean, timestamp, foreignKey } from "drizzle-orm/pg-core";
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

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Listing = typeof listings.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
