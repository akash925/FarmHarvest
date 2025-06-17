import { z } from 'zod';

// Define configuration schema
const configSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // Session
  SESSION_SECRET: z.string().min(1, 'SESSION_SECRET is required'),
  
  // OAuth (optional)
  FACEBOOK_APP_ID: z.string().optional(),
  FACEBOOK_APP_SECRET: z.string().optional(),
  INSTAGRAM_CLIENT_ID: z.string().optional(),
  INSTAGRAM_CLIENT_SECRET: z.string().optional(),
  
  // Email
  SENDGRID_API_KEY: z.string().optional(),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(Number),
  
  // File upload
  MAX_FILE_SIZE: z.string().default('10485760').transform(Number), // 10MB
  ALLOWED_FILE_TYPES: z.string().default('image/jpeg,image/png,image/webp,video/mp4'),
  
  // Rate limiting
  RATE_LIMIT_WINDOW: z.string().default('900000').transform(Number), // 15 minutes
  RATE_LIMIT_MAX: z.string().default('100').transform(Number),
});

// Parse and validate environment variables
function parseConfig() {
  try {
    return configSchema.parse({
      DATABASE_URL: process.env.DATABASE_URL,
      SESSION_SECRET: process.env.SESSION_SECRET || 'farm-produce-marketplace-secret-key-2024',
      FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
      FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET,
      INSTAGRAM_CLIENT_ID: process.env.INSTAGRAM_CLIENT_ID,
      INSTAGRAM_CLIENT_SECRET: process.env.INSTAGRAM_CLIENT_SECRET,
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      MAX_FILE_SIZE: process.env.MAX_FILE_SIZE,
      ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES,
      RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW,
      RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX,
    });
  } catch (error) {
    console.error('Configuration validation failed:', error);
    process.exit(1);
  }
}

export const config = parseConfig();

// Feature flags based on configuration
export const features = {
  facebookAuth: !!(config.FACEBOOK_APP_ID && config.FACEBOOK_APP_SECRET),
  instagramAuth: !!(config.INSTAGRAM_CLIENT_ID && config.INSTAGRAM_CLIENT_SECRET),
  emailNotifications: !!config.SENDGRID_API_KEY,
  stripePayments: !!(config.STRIPE_SECRET_KEY && config.STRIPE_PUBLISHABLE_KEY),
};

// Additional feature flags
export const ENABLE_PAYMENTS = !!process.env.STRIPE_SECRET_KEY; 