import { 
  users, type User, type InsertUser,
  listings, type Listing, type InsertListing,
  orders, type Order, type InsertOrder,
  reviews, type Review, type InsertReview,
  sellerProfiles, type SellerProfile, type InsertSellerProfile,
  profileMedia, type ProfileMedia, type InsertProfileMedia,
  farmSpaces, type FarmSpace, type InsertFarmSpace
} from "@shared/schema";
import { db } from "./db";
import { eq, and, inArray, desc, gte, like, lte, or, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByAuthId(authType: string, authId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User>;
  
  // Listing methods
  getListing(id: number): Promise<Listing | undefined>;
  getListingsByUser(userId: number): Promise<Listing[]>;
  getListingsByCategory(category: string): Promise<Listing[]>;
  getListingsByZip(zip: string): Promise<Listing[]>;
  searchListings(query: string, category?: string, zip?: string): Promise<Listing[]>;
  getFeaturedListings(limit?: number): Promise<Listing[]>;
  createListing(listing: InsertListing): Promise<Listing>;
  updateListing(id: number, listing: Partial<InsertListing>): Promise<Listing>;
  deleteListing(id: number): Promise<boolean>;
  
  // Order methods
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByBuyer(userId: number): Promise<Order[]>;
  getOrdersBySeller(userId: number): Promise<Order[]>;
  getOrdersByStripeSessionId(sessionId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  
  // Review methods
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByOrder(orderId: number): Promise<Review[]>;
  getReviewsBySeller(sellerId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Top sellers
  getTopSellers(limit?: number): Promise<User[]>;
  
  // Seller profile methods
  getSellerProfile(userId: number): Promise<SellerProfile | undefined>;
  createSellerProfile(profile: InsertSellerProfile): Promise<SellerProfile>;
  updateSellerProfile(userId: number, profile: Partial<InsertSellerProfile>): Promise<SellerProfile>;
  
  // Profile media methods
  getProfileMedia(sellerProfileId: number): Promise<ProfileMedia[]>;
  createProfileMedia(media: InsertProfileMedia): Promise<ProfileMedia>;
  deleteProfileMedia(id: number): Promise<boolean>;
  
  // Farm space methods
  getFarmSpace(id: number): Promise<FarmSpace | undefined>;
  getFarmSpacesByProfile(sellerProfileId: number): Promise<FarmSpace[]>;
  getAllAvailableFarmSpaces(): Promise<FarmSpace[]>;
  createFarmSpace(farmSpace: InsertFarmSpace): Promise<FarmSpace>;
  updateFarmSpace(id: number, farmSpace: Partial<InsertFarmSpace>): Promise<FarmSpace>;
  deleteFarmSpace(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async getUserByAuthId(authType: string, authId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(
      and(
        eq(users.authType, authType),
        eq(users.authId, authId)
      )
    );
    return user;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  // Listing methods
  async getListing(id: number): Promise<Listing | undefined> {
    const [listing] = await db.select().from(listings).where(eq(listings.id, id));
    return listing;
  }
  
  async getListingsByUser(userId: number): Promise<Listing[]> {
    return db.select().from(listings).where(eq(listings.userId, userId)).orderBy(desc(listings.createdAt));
  }
  
  async getListingsByCategory(category: string): Promise<Listing[]> {
    return db.select().from(listings).where(eq(listings.category, category)).orderBy(desc(listings.createdAt));
  }
  
  async getListingsByZip(zip: string): Promise<Listing[]> {
    // Join with users to filter by zip
    const result = await db
      .select({
        listing: listings
      })
      .from(listings)
      .innerJoin(users, eq(listings.userId, users.id))
      .where(eq(users.zip, zip))
      .orderBy(desc(listings.createdAt));
      
    return result.map(r => r.listing);
  }
  
  async searchListings(query: string, category?: string, zip?: string): Promise<Listing[]> {
    let conditions = [];
    
    // Search by title or description
    if (query) {
      conditions.push(
        or(
          like(listings.title, `%${query}%`),
          like(listings.description || '', `%${query}%`)
        )
      );
    }
    
    // Filter by category
    if (category) {
      conditions.push(eq(listings.category, category));
    }
    
    // If there are no conditions, return all listings
    if (conditions.length === 0) {
      return db.select().from(listings).orderBy(desc(listings.createdAt));
    }
    
    let query_results = db
      .select()
      .from(listings)
      .where(and(...conditions))
      .orderBy(desc(listings.createdAt));
      
    // Filter by zip (requires a join)
    if (zip) {
      const result = await db
        .select({
          listing: listings
        })
        .from(listings)
        .innerJoin(users, eq(listings.userId, users.id))
        .where(
          and(
            ...conditions, 
            eq(users.zip, zip)
          )
        )
        .orderBy(desc(listings.createdAt));
        
      return result.map(r => r.listing);
    }
    
    return query_results;
  }
  
  async getFeaturedListings(limit: number = 8): Promise<Listing[]> {
    // For now, just return the most recent listings as featured
    return db.select().from(listings).orderBy(desc(listings.createdAt)).limit(limit);
  }
  
  async createListing(listing: InsertListing): Promise<Listing> {
    const [newListing] = await db.insert(listings).values(listing).returning();
    return newListing;
  }
  
  async updateListing(id: number, listing: Partial<InsertListing>): Promise<Listing> {
    const [updatedListing] = await db
      .update(listings)
      .set(listing)
      .where(eq(listings.id, id))
      .returning();
    return updatedListing;
  }
  
  async deleteListing(id: number): Promise<boolean> {
    const result = await db.delete(listings).where(eq(listings.id, id)).returning();
    return result.length > 0;
  }
  
  // Order methods
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }
  
  async getOrdersByBuyer(userId: number): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.buyerId, userId)).orderBy(desc(orders.createdAt));
  }
  
  async getOrdersBySeller(userId: number): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.sellerId, userId)).orderBy(desc(orders.createdAt));
  }
  
  async getOrdersByStripeSessionId(sessionId: string): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.stripeSessionId, sessionId));
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }
  
  // Review methods
  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review;
  }
  
  async getReviewsByOrder(orderId: number): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.orderId, orderId));
  }
  
  async getReviewsBySeller(sellerId: number): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.sellerId, sellerId)).orderBy(desc(reviews.createdAt));
  }
  
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }
  
  // Top sellers
  async getTopSellers(limit: number = 3): Promise<User[]> {
    // Get sellers with the most orders
    // Using drizzle count aggregation correctly
    const sellerOrders = await db
      .select({
        sellerId: orders.sellerId,
        orderCount: sql`count(${orders.id})`.as('count')
      })
      .from(orders)
      .groupBy(orders.sellerId)
      .orderBy(sql`count(${orders.id}) desc`)
      .limit(limit);
      
    const sellerIds = sellerOrders.map(so => so.sellerId);
    
    if (sellerIds.length === 0) {
      // If no orders, just return some users
      return db.select().from(users).limit(limit);
    }
    
    return db.select().from(users).where(inArray(users.id, sellerIds));
  }

  // Enhanced Seller Profile methods
  async getSellerProfile(userId: number): Promise<SellerProfile | undefined> {
    const [profile] = await db.select().from(sellerProfiles).where(eq(sellerProfiles.userId, userId));
    return profile;
  }
  
  async createSellerProfile(profile: InsertSellerProfile): Promise<SellerProfile> {
    const [newProfile] = await db.insert(sellerProfiles).values(profile).returning();
    return newProfile;
  }
  
  async updateSellerProfile(userId: number, profileData: Partial<InsertSellerProfile>): Promise<SellerProfile> {
    const [profile] = await db.select().from(sellerProfiles).where(eq(sellerProfiles.userId, userId));
    
    if (!profile) {
      throw new Error(`Seller profile not found for user ${userId}`);
    }
    
    const [updatedProfile] = await db
      .update(sellerProfiles)
      .set({ ...profileData, updatedAt: new Date() })
      .where(eq(sellerProfiles.id, profile.id))
      .returning();
    
    return updatedProfile;
  }
  
  // Profile Media methods
  async getProfileMedia(sellerProfileId: number): Promise<ProfileMedia[]> {
    return db.select().from(profileMedia).where(eq(profileMedia.sellerProfileId, sellerProfileId));
  }
  
  async createProfileMedia(media: InsertProfileMedia): Promise<ProfileMedia> {
    const [newMedia] = await db.insert(profileMedia).values(media).returning();
    return newMedia;
  }
  
  async deleteProfileMedia(id: number): Promise<boolean> {
    await db.delete(profileMedia).where(eq(profileMedia.id, id));
    return true; // Assuming deletion was successful
  }
  
  // Farm Space methods
  async getFarmSpace(id: number): Promise<FarmSpace | undefined> {
    const [space] = await db.select().from(farmSpaces).where(eq(farmSpaces.id, id));
    return space;
  }
  
  async getFarmSpacesByProfile(sellerProfileId: number): Promise<FarmSpace[]> {
    return db.select().from(farmSpaces).where(eq(farmSpaces.sellerProfileId, sellerProfileId));
  }
  
  async getAllAvailableFarmSpaces(): Promise<FarmSpace[]> {
    return db.select().from(farmSpaces);
  }
  
  async createFarmSpace(farmSpace: InsertFarmSpace): Promise<FarmSpace> {
    const [newSpace] = await db.insert(farmSpaces).values(farmSpace).returning();
    return newSpace;
  }
  
  async updateFarmSpace(id: number, farmSpaceData: Partial<InsertFarmSpace>): Promise<FarmSpace> {
    const [updatedSpace] = await db
      .update(farmSpaces)
      .set({ ...farmSpaceData, updatedAt: new Date() })
      .where(eq(farmSpaces.id, id))
      .returning();
    
    return updatedSpace;
  }
  
  async deleteFarmSpace(id: number): Promise<boolean> {
    await db.delete(farmSpaces).where(eq(farmSpaces.id, id));
    return true; // Assuming deletion was successful
  }
}

export const storage = new DatabaseStorage();
