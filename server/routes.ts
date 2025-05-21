import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Stripe from "stripe";
import { z } from "zod";
import {
  insertListingSchema,
  insertOrderSchema,
  insertReviewSchema
} from "@shared/schema";

// Get Stripe secret key from environment
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("Missing STRIPE_SECRET_KEY. Stripe payments won't work.");
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
}) : null;

// Platform fee percentage (15%)
const PLATFORM_FEE_PERCENT = 15;

export async function registerRoutes(app: Express): Promise<Server> {
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
  
  app.get("/api/auth/session", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUserById(req.session.userId);
      
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "User not found" });
      }
      
      return res.status(200).json({ user });
    } catch (error) {
      console.error("Session error:", error);
      return res.status(500).json({ message: "Server error" });
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
  
  // Listing routes
  app.get("/api/listings", async (req, res) => {
    try {
      const { query, category, zip } = req.query;
      
      const listings = await storage.searchListings(
        query as string || "",
        category as string,
        zip as string
      );
      
      return res.status(200).json({ listings });
    } catch (error) {
      console.error("Get listings error:", error);
      return res.status(500).json({ message: "Server error" });
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
      
      // Validate listing data
      const validationResult = insertListingSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid listing data",
          errors: validationResult.error.errors
        });
      }
      
      const listingData = validationResult.data;
      listingData.userId = req.session.userId;
      
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
  
  const httpServer = createServer(app);
  return httpServer;
}
