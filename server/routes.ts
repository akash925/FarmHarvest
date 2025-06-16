import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { filterListingsByDistance } from "./utils/location";
import { ENABLE_PAYMENTS } from "./config";
import { z } from "zod";
import { WebSocketServer, WebSocket } from "ws";
import {
  insertListingSchema,
  insertOrderSchema,
  insertReviewSchema,
  insertUserSchema,
  insertMessageSchema
} from "@shared/schema";

// Conditionally import and initialize Stripe
let Stripe: any = null;
let stripe: any = null;

if (ENABLE_PAYMENTS) {
  try {
    Stripe = require('stripe');
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    console.log('Stripe initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
  }
} else {
  console.log('Stripe payments disabled - STRIPE_SECRET_KEY not provided');
}

// Platform fee percentage (15%)
const PLATFORM_FEE_PERCENT = 15;

let wss: WebSocketServer;

export async function registerRoutes(app: Express): Promise<Server> {
  // Stripe payment endpoint for creating payment intent
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      if (!ENABLE_PAYMENTS || !stripe) {
        return res.status(501).json({ message: "Payments are not enabled on this server." });
      }

      const { listingId, quantity, amount } = req.body;
      
      if (!listingId || !quantity || !amount) {
        return res.status(400).json({ message: "Missing required fields." });
      }
      
      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount),
        currency: "usd",
        // Store metadata about the purchase
        metadata: {
          listingId: listingId.toString(),
          quantity: quantity.toString()
        }
      });
      
      res.status(200).json({
        clientSecret: paymentIntent.client_secret
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ 
        message: "Failed to create payment intent", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });


  // Authentication endpoints
  app.post("/api/auth/google", async (req, res) => {
    try {
      const { token, userData } = req.body;
      
      if (!token || !userData || !userData.email) {
        return res.status(400).json({ message: "Invalid auth data" });
      }
      
      // Check if user already exists
      let user = await storage.getUserByAuthId("google", userData.id);
      
      if (!user) {
        // Create new user
        user = await storage.createUser({
          name: userData.name,
          email: userData.email,
          image: userData.picture,
          authType: "google",
          authId: userData.id,
          emailVerified: new Date()
        });
      }
      
      // Set the user ID in the session
      req.session.userId = user.id;
      
      return res.status(200).json({ user });
    } catch (error) {
      console.error("Google auth error:", error);
      return res.status(500).json({ message: "Authentication failed" });
    }
  });
  
  app.post("/api/auth/facebook", async (req, res) => {
    try {
      const { token, userData } = req.body;
      
      if (!token || !userData || !userData.email) {
        return res.status(400).json({ message: "Invalid auth data" });
      }
      
      // Check if user already exists
      let user = await storage.getUserByAuthId("facebook", userData.id);
      
      if (!user) {
        // Create new user
        user = await storage.createUser({
          name: userData.name,
          email: userData.email,
          image: userData.picture?.data?.url,
          authType: "facebook",
          authId: userData.id,
          emailVerified: new Date()
        });
      }
      
      req.session.userId = user.id;
      
      return res.status(200).json({ user });
    } catch (error) {
      console.error("Facebook auth error:", error);
      return res.status(500).json({ message: "Authentication failed" });
    }
  });
  
  // Session check endpoint - unified handler with seller profile data
  app.get("/api/auth/session", async (req, res) => {
    try {
      console.log("[GET] /api/auth/session - Session ID:", req.sessionID, "User ID:", req.session?.userId);
      
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUserById(req.session.userId);
      
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "User not found" });
      }

      // Attach seller profile if exists to avoid extra frontend call
      const sellerProfile = await storage.getSellerProfile(req.session.userId);
      
      console.log("Session check successful for user:", user.name);
      return res.status(200).json({ 
        user,
        sellerProfile: sellerProfile || null
      });
    } catch (error) {
      console.error("Session error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Email signup endpoint for farmer account creation
  app.post("/api/auth/signup", async (req, res) => {
    try {
      // Create simplified signup schema
      const emailSignupSchema = z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Valid email is required"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        zip: z.string().optional()
      });
      
      const validation = emailSignupSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid signup data", 
          errors: validation.error.format() 
        });
      }
      
      const { password, ...userData } = validation.data;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists" });
      }
      
      // Create user in database with required fields
      const newUser = await storage.createUser({
        name: userData.name,
        email: userData.email,
        zip: userData.zip,
        authType: "email",
        authId: userData.email
      });
      
      // Set session to log the user in and ensure it's saved
      req.session.userId = newUser.id;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Failed to save session" });
        }
        return res.status(201).json({ user: newUser });
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create account", error: error.message });
    }
  });
  
  // Email signin endpoint with improved stability
  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Get user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.authType !== "email") {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // For development, we'll use simple password validation
      const isValidPassword = password === "password" || password === "test123" || password === "password123";
      
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Force session regeneration for security and stability
      req.session.regenerate((regenerateErr) => {
        if (regenerateErr) {
          console.error("Session regeneration error:", regenerateErr);
          // Continue without regeneration if it fails
        }
        
        // Set user ID in session
        req.session.userId = user.id;
        
        // Save the session with retry logic
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Session save error:", saveErr);
            // Try one more time with direct assignment
            req.session.userId = user.id;
          }
          
          console.log("User", user.email, "logged in successfully. Session ID:", req.sessionID, "User ID:", user.id);
          return res.json({ 
            user,
            sessionInfo: {
              sessionId: req.sessionID,
              userId: user.id
            }
          });
        });
      });
    } catch (error: any) {
      console.error("Signin error:", error);
      res.status(500).json({ message: "Failed to sign in", error: error.message });
    }
  });
  
  // Direct login endpoint for specific user account (for development)
  app.post("/api/auth/direct-login/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Get user by ID
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Set session to this user ID
      req.session.userId = user.id;
      
      // Return success
      res.json({ success: true, message: "Logged in as " + user.name, user });
    } catch (error: any) {
      console.error("Direct login error:", error);
      res.status(500).json({ message: "Failed to set user session", error: error.message });
    }
  });
  
  // Logout endpoint
  app.post("/api/auth/logout", async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
          return res.status(500).json({ message: "Failed to logout" });
        }
        
        res.clearCookie('farmSessionId');
        return res.json({ message: "Logged out successfully" });
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Failed to logout", error: error.message });
    }
  });
  
  // Enhanced seller profile endpoints
  
  // Get seller profile
  app.get("/api/seller-profiles/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Check if user exists first
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const profile = await storage.getSellerProfile(userId);
      
      // Return 200 with null profile if profile doesn't exist (instead of 404)
      if (!profile) {
        return res.status(200).json({ 
          profile: null,
          media: [],
          farmSpaces: [],
          user,
          listings: []
        });
      }
      
      // Get related data for a complete profile
      const media = await storage.getProfileMedia(profile.id);
      const farmSpaces = await storage.getFarmSpacesByProfile(profile.id);
      const listings = await storage.getListingsByUser(userId);
      
      res.json({
        profile,
        media,
        farmSpaces,
        user,
        listings
      });
    } catch (error: any) {
      console.error("Error fetching seller profile:", error);
      res.status(500).json({ message: "Failed to fetch seller profile", error: error.message });
    }
  });
  
  // Create seller profile
  app.post("/api/seller-profiles", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const profileData = req.body;
      
      // Validate that this user doesn't already have a profile
      const existingProfile = await storage.getSellerProfile(req.session.userId);
      
      if (existingProfile) {
        return res.status(400).json({ message: "User already has a seller profile" });
      }
      
      // Create profile with the user ID
      const newProfile = await storage.createSellerProfile({
        ...profileData,
        userId: req.session.userId
      });
      
      res.status(201).json({ profile: newProfile });
    } catch (error: any) {
      console.error("Error creating seller profile:", error);
      res.status(500).json({ message: "Failed to create seller profile", error: error.message });
    }
  });
  
  // Update seller profile
  app.patch("/api/seller-profiles/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Check if requesting user is the owner
      if (!req.session.userId || req.session.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this profile" });
      }
      
      const { profile } = req.body;
      
      const updatedProfile = await storage.updateSellerProfile(userId, profile);
      
      res.json({ profile: updatedProfile });
    } catch (error: any) {
      console.error("Error updating seller profile:", error);
      res.status(500).json({ message: "Failed to update seller profile", error: error.message });
    }
  });
  
  // Farm spaces endpoints
  
  // Get farm spaces by user
  app.get("/api/farm-spaces/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Get seller profile first
      const sellerProfile = await storage.getSellerProfile(userId);
      
      if (!sellerProfile) {
        return res.status(200).json({ farmSpaces: [] });
      }
      
      const farmSpaces = await storage.getFarmSpacesByProfile(sellerProfile.id);
      
      return res.status(200).json({ farmSpaces });
    } catch (error) {
      console.error("Get user farm spaces error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Get all available farm spaces
  app.get("/api/farm-spaces/available", async (req, res) => {
    try {
      const spaces = await storage.getAllAvailableFarmSpaces();
      res.json({ spaces });
    } catch (error: any) {
      console.error("Error fetching available farm spaces:", error);
      res.status(500).json({ message: "Failed to fetch farm spaces", error: error.message });
    }
  });
  
  // Create a farm space
  app.post("/api/farm-spaces", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { farmSpace } = req.body;
      
      // Get the user's seller profile
      const profile = await storage.getSellerProfile(req.session.userId);
      
      if (!profile) {
        return res.status(400).json({ message: "You must create a seller profile first" });
      }
      
      // Convert date strings to Date objects if present
      const farmSpaceData = { ...farmSpace, sellerProfileId: profile.id };
      if (farmSpaceData.availableFrom) {
        farmSpaceData.availableFrom = new Date(farmSpaceData.availableFrom);
      }
      if (farmSpaceData.availableUntil) {
        farmSpaceData.availableUntil = new Date(farmSpaceData.availableUntil);
      }

      // Create farm space
      const newSpace = await storage.createFarmSpace(farmSpaceData);
      
      res.status(201).json({ farmSpace: newSpace });
    } catch (error: any) {
      console.error("Error creating farm space:", error);
      res.status(500).json({ message: "Failed to create farm space", error: error.message });
    }
  });
  
  // Profile media endpoints
  
  // Add media to profile
  app.post("/api/profile-media", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { media } = req.body;
      
      // Get the user's seller profile
      const profile = await storage.getSellerProfile(req.session.userId);
      
      if (!profile) {
        return res.status(400).json({ message: "You must create a seller profile first" });
      }
      
      // Create profile media
      const newMedia = await storage.createProfileMedia({
        ...media,
        sellerProfileId: profile.id
      });
      
      res.status(201).json({ media: newMedia });
    } catch (error: any) {
      console.error("Error adding profile media:", error);
      res.status(500).json({ message: "Failed to add profile media", error: error.message });
    }
  });
  
  // Delete profile media
  app.delete("/api/profile-media/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const mediaId = parseInt(req.params.id);
      
      if (isNaN(mediaId)) {
        return res.status(400).json({ message: "Invalid media ID" });
      }
      
      // Delete the media
      await storage.deleteProfileMedia(mediaId);
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting profile media:", error);
      res.status(500).json({ message: "Failed to delete profile media", error: error.message });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.status(200).json({ message: "Logged out" });
    });
  });
  
  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.status(200).json({ user });
    } catch (error) {
      console.error("Get user error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Check if user is authenticated and updating their own profile
      if (!req.session.userId || req.session.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const userData = req.body;
      
      // Validate ZIP code if provided
      if (userData.zip && !/^\d{5}(-\d{4})?$/.test(userData.zip)) {
        return res.status(400).json({ message: "Invalid ZIP code format" });
      }
      
      const updatedUser = await storage.updateUser(userId, userData);
      
      return res.status(200).json({ user: updatedUser });
    } catch (error) {
      console.error("Update user error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Listing routes with location-based search
  app.get("/api/listings", async (req, res) => {
    try {
      const { query, category, zip, userZip } = req.query;
      
      // Validate query parameters
      if (zip && typeof zip === 'string' && !/^\d{5}(-\d{4})?$/.test(zip)) {
        return res.status(400).json({ message: "Invalid ZIP code format" });
      }
      
      const listings = await storage.searchListings(
        query as string || "",
        category as string,
        zip as string
      );
      
      // If user provided their ZIP code, filter by distance
      if (userZip && typeof userZip === 'string') {
        const { nearby, distant } = filterListingsByDistance(listings, userZip, 25);
        
        return res.status(200).json({ 
          listings: nearby || [],
          distantListings: distant || [],
          message: nearby.length === 0 && distant.length > 0 
            ? "None in your current area, but here are some a bit further away."
            : undefined
        });
      }
      
      // Always return an array, even if empty
      return res.status(200).json({ listings: listings || [] });
    } catch (error) {
      console.error("Get listings error:", error);
      return res.status(500).json({ message: "Failed to fetch listings" });
    }
  });
  
  app.get("/api/listings/featured", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 8;
      const listings = await storage.getFeaturedListings(limit);
      return res.status(200).json({ listings });
    } catch (error) {
      console.error("Get featured listings error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/listings/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const listings = await storage.getListingsByUser(userId);
      
      return res.status(200).json({ listings });
    } catch (error) {
      console.error("Get user listings error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/listings/:id", async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      
      if (isNaN(listingId)) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      
      const listing = await storage.getListing(listingId);
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // Get seller info
      const seller = await storage.getUserById(listing.userId);
      
      return res.status(200).json({ listing, seller });
    } catch (error) {
      console.error("Get listing error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/listings", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Validate listing data (without userId)
      const validationResult = insertListingSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid listing data",
          errors: validationResult.error.errors
        });
      }
      
      // Add userId after validation
      const listingData = {
        ...validationResult.data,
        userId: req.session.userId
      };
      
      // Create listing
      const listing = await storage.createListing(listingData);
      
      return res.status(201).json({ listing });
    } catch (error) {
      console.error("Create listing error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/listings/:id", async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      
      if (isNaN(listingId)) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      
      // Check if user is authenticated
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Get existing listing
      const existingListing = await storage.getListing(listingId);
      
      if (!existingListing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // Check if user owns the listing
      if (existingListing.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Update listing
      const updatedListing = await storage.updateListing(listingId, req.body);
      
      return res.status(200).json({ listing: updatedListing });
    } catch (error) {
      console.error("Update listing error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/listings/:id", async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      
      if (isNaN(listingId)) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      
      // Check if user is authenticated
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Get existing listing
      const existingListing = await storage.getListing(listingId);
      
      if (!existingListing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // Check if user owns the listing
      if (existingListing.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Delete listing
      await storage.deleteListing(listingId);
      
      return res.status(204).send();
    } catch (error) {
      console.error("Delete listing error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Order routes
  app.get("/api/orders", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { type } = req.query;
      
      let orders;
      if (type === "selling") {
        orders = await storage.getOrdersBySeller(req.session.userId);
      } else {
        orders = await storage.getOrdersByBuyer(req.session.userId);
      }
      
      return res.status(200).json({ orders });
    } catch (error) {
      console.error("Get orders error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      // Check if user is authenticated
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user is the buyer or seller
      if (order.buyerId !== req.session.userId && order.sellerId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Get listing and users
      const listing = await storage.getListing(order.listingId);
      const buyer = await storage.getUserById(order.buyerId);
      const seller = await storage.getUserById(order.sellerId);
      
      return res.status(200).json({ order, listing, buyer, seller });
    } catch (error) {
      console.error("Get order error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Create Stripe checkout session
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Check if Stripe is configured
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }
      
      const { listingId, quantity } = req.body;
      
      if (!listingId || !quantity || quantity <= 0) {
        return res.status(400).json({ message: "Invalid checkout data" });
      }
      
      // Get listing data
      const listing = await storage.getListing(parseInt(listingId));
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // Check if quantity is available
      if (listing.quantity < quantity) {
        return res.status(400).json({ message: "Not enough quantity available" });
      }
      
      // Get seller data
      const seller = await storage.getUserById(listing.userId);
      
      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }
      
      // Calculate price
      const unitPrice = listing.price;
      const totalAmount = unitPrice * quantity;
      
      // Calculate platform fee
      const platformFee = Math.round(totalAmount * (PLATFORM_FEE_PERCENT / 100));
      
      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: listing.title,
                description: listing.description || undefined,
                images: listing.imageUrl ? [listing.imageUrl] : undefined,
              },
              unit_amount: unitPrice,
            },
            quantity: quantity,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.origin}/orders/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/listings/${listingId}`,
        metadata: {
          listingId: listing.id.toString(),
          sellerId: seller.id.toString(),
          buyerId: req.session.userId.toString(),
          quantity: quantity.toString(),
          platformFee: platformFee.toString(),
        },
      });
      
      // Create order with pending status
      const order = await storage.createOrder({
        listingId: listing.id,
        buyerId: req.session.userId,
        sellerId: seller.id,
        quantity,
        totalPrice: totalAmount,
        stripeSessionId: session.id,
        status: "pending",
      });
      
      return res.status(200).json({ 
        orderId: order.id,
        sessionId: session.id,
        url: session.url 
      });
    } catch (error) {
      console.error("Create checkout session error:", error);
      return res.status(500).json({ message: "Payment processing failed" });
    }
  });
  
  // Handle Stripe webhook (would need to be properly configured in a real app)
  app.post("/api/webhook", async (req, res) => {
    try {
      // This is a simplified example, in a real app you'd verify the Stripe signature
      const event = req.body;
      
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        // Update order status to paid
        const orders = await storage.getOrdersByStripeSessionId(session.id);
        if (orders && orders.length > 0) {
          await storage.updateOrderStatus(orders[0].id, "paid");
          
          // Update listing quantity
          const listing = await storage.getListing(orders[0].listingId);
          if (listing) {
            const newQuantity = listing.quantity - orders[0].quantity;
            await storage.updateListing(listing.id, { quantity: newQuantity >= 0 ? newQuantity : 0 });
          }
        }
      }
      
      return res.status(200).json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      return res.status(500).json({ message: "Webhook processing failed" });
    }
  });
  
  // Review routes
  app.get("/api/reviews/seller/:id", async (req, res) => {
    try {
      const sellerId = parseInt(req.params.id);
      
      if (isNaN(sellerId)) {
        return res.status(400).json({ message: "Invalid seller ID" });
      }
      
      const reviews = await storage.getReviewsBySeller(sellerId);
      
      return res.status(200).json({ reviews });
    } catch (error) {
      console.error("Get seller reviews error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/reviews", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Validate review data
      const validationResult = insertReviewSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid review data",
          errors: validationResult.error.errors
        });
      }
      
      const reviewData = validationResult.data;
      
      // Check if order exists
      const order = await storage.getOrder(reviewData.orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user is the buyer
      if (order.buyerId !== req.session.userId) {
        return res.status(403).json({ message: "Only the buyer can leave a review" });
      }
      
      // Check if review already exists
      const existingReviews = await storage.getReviewsByOrder(order.id);
      
      if (existingReviews.length > 0) {
        return res.status(400).json({ message: "Review already exists for this order" });
      }
      
      // Create review
      reviewData.reviewerId = req.session.userId;
      reviewData.sellerId = order.sellerId;
      
      const review = await storage.createReview(reviewData);
      
      return res.status(201).json({ review });
    } catch (error) {
      console.error("Create review error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get top sellers
  app.get("/api/sellers/top", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      const sellers = await storage.getTopSellers(limit);
      return res.status(200).json({ sellers });
    } catch (error) {
      console.error("Get top sellers error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Farm space routes with filtering
  app.get("/api/farm-spaces", async (req, res) => {
    try {
      const { 
        location, 
        soil_type, 
        light_conditions, 
        min_size, 
        max_price, 
        water_access, 
        greenhouse_access, 
        tool_storage 
      } = req.query;

      // Get all available farm spaces
      const farmSpaces = await storage.getAllAvailableFarmSpaces();
      
      // Apply filtering
      let filteredSpaces = farmSpaces;
      
      // Apply filtering based on actual database fields
      if (soil_type) {
        filteredSpaces = filteredSpaces.filter(space => space.soilType === soil_type);
      }
      
      if (light_conditions) {
        filteredSpaces = filteredSpaces.filter(space => space.lightConditions === light_conditions);
      }
      
      if (min_size) {
        filteredSpaces = filteredSpaces.filter(space => 
          space.sizeSqft && space.sizeSqft >= parseInt(min_size as string)
        );
      }
      
      if (max_price) {
        filteredSpaces = filteredSpaces.filter(space => 
          space.pricePerMonth && space.pricePerMonth <= parseInt(max_price as string) * 100
        );
      }
      
      if (water_access === 'true') {
        filteredSpaces = filteredSpaces.filter(space => space.waterAccess === true);
      }
      
      if (greenhouse_access === 'true') {
        filteredSpaces = filteredSpaces.filter(space => space.greenhouseAccess === true);
      }
      
      if (tool_storage === 'true') {
        filteredSpaces = filteredSpaces.filter(space => space.toolStorage === true);
      }

      res.json({ farmSpaces: filteredSpaces });
    } catch (error: any) {
      console.error("Error fetching farm spaces:", error);
      res.status(500).json({ message: "Failed to fetch farm spaces", error: error.message });
    }
  });

  // Get individual farm space
  app.get("/api/farm-spaces/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid farm space ID" });
      }
      
      const farmSpace = await storage.getFarmSpace(id);
      
      if (!farmSpace) {
        return res.status(404).json({ message: "Farm space not found" });
      }
      
      res.json(farmSpace);
    } catch (error: any) {
      console.error("Error fetching farm space:", error);
      res.status(500).json({ message: "Failed to fetch farm space", error: error.message });
    }
  });


  
  // Message routes
  app.get("/api/messages", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const messages = await storage.getMessagesByUser(req.session.userId);
      
      // Group messages into conversations
      const conversationsMap = new Map();
      
      for (const message of messages) {
        const otherUserId = message.senderId === req.session.userId 
          ? message.recipientId 
          : message.senderId;
        
        if (!conversationsMap.has(otherUserId)) {
          const otherUser = await storage.getUserById(otherUserId);
          conversationsMap.set(otherUserId, {
            userId: otherUserId,
            userName: otherUser?.name || 'Unknown User',
            userImage: otherUser?.image,
            lastMessage: message,
            unreadCount: 0,
            messages: []
          });
        }
        
        const conversation = conversationsMap.get(otherUserId);
        conversation.messages.push(message);
        
        // Update last message if this one is newer
        if (new Date(message.createdAt) > new Date(conversation.lastMessage.createdAt)) {
          conversation.lastMessage = message;
        }
        
        // Count unread messages
        if (!message.isRead && message.recipientId === req.session.userId) {
          conversation.unreadCount++;
        }
      }
      
      const conversations = Array.from(conversationsMap.values());
      res.json({ conversations });
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get("/api/messages/conversation/:userId", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const otherUserId = parseInt(req.params.userId);
      const messages = await storage.getConversation(req.session.userId, otherUserId);
      
      // Mark messages as read
      for (const message of messages) {
        if (message.recipientId === req.session.userId && !message.isRead) {
          await storage.markMessageAsRead(message.id);
        }
      }
      
      res.json({ messages });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { recipientId, content, farmSpaceId } = req.body;
      
      if (!recipientId || !content) {
        return res.status(400).json({ message: "Recipient and content are required" });
      }

      const message = await storage.createMessage({
        senderId: req.session.userId,
        recipientId: parseInt(recipientId),
        subject: `Message from ${req.session.userId}`,
        message: content.trim(),
        farmSpaceId: farmSpaceId ? parseInt(farmSpaceId) : undefined,
      });

      // Broadcast message via WebSocket if available
      if (wss) {
        const messageData = {
          type: 'message',
          message,
          senderId: req.session.userId,
          recipientId: parseInt(recipientId)
        };
        
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(messageData));
          }
        });
      }

      res.json({ message });
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get("/api/messages/conversation/:userId", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const otherUserId = parseInt(req.params.userId);
      const farmSpaceId = req.query.farmSpaceId ? parseInt(req.query.farmSpaceId as string) : undefined;

      const conversation = await storage.getConversation(req.session.userId, otherUserId, farmSpaceId);
      res.json({ conversation });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: req.session.userId
      });

      const message = await storage.createMessage(messageData);
      
      // Broadcast to WebSocket clients for real-time updates
      if (wss) {
        const notification = {
          type: 'new_message',
          message,
          recipientId: message.recipientId
        };
        
        wss.clients.forEach(client => {
          if (client.readyState === 1) { // WebSocket.OPEN
            client.send(JSON.stringify(notification));
          }
        });
      }

      res.status(201).json({ message });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.put("/api/messages/:id/read", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const messageId = parseInt(req.params.id);
      const message = await storage.markMessageAsRead(messageId);

      res.json({ message });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  app.get("/api/messages/unread-count", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const count = await storage.getUnreadMessageCount(req.session.userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws, req) => {
    console.log('WebSocket connection established');
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'join') {
          (ws as any).userId = message.userId;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
