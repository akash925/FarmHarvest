import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { config } from './config';

// Extend the Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        name: string;
        email: string;
        authType: string;
      };
    }
  }
}

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Authentication middleware
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ 
      message: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }
  
  // Add user info to request if session exists
  req.user = {
    id: req.session.userId,
    name: '', // Will be populated from database if needed
    email: '',
    authType: ''
  };
  
  next();
};

// Optional authentication middleware
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.userId) {
    req.user = {
      id: req.session.userId,
      name: '',
      email: '',
      authType: ''
    };
  }
  next();
};

// Rate limiting middleware
export const rateLimit = (windowMs: number = config.RATE_LIMIT_WINDOW, max: number = config.RATE_LIMIT_MAX) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    // Clean up expired entries
    for (const [k, v] of rateLimitStore.entries()) {
      if (now > v.resetTime) {
        rateLimitStore.delete(k);
      }
    }
    
    const current = rateLimitStore.get(key);
    
    if (!current) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (now > current.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (current.count >= max) {
      return res.status(429).json({
        message: 'Too many requests',
        retryAfter: Math.ceil((current.resetTime - now) / 1000)
      });
    }
    
    current.count++;
    next();
  };
};

// Validation middleware factory
export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({
          message: 'Validation error',
          errors: result.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      
      // Replace req.body with validated data
      req.body = result.data;
      next();
    } catch (error) {
      res.status(500).json({ message: 'Validation processing error' });
    }
  };
};

// Resource ownership middleware
export const requireOwnership = (getUserId: (req: Request) => number | Promise<number>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const resourceUserId = typeof getUserId === 'function' 
        ? await getUserId(req) 
        : getUserId;
      
      if (req.user.id !== resourceUserId) {
        return res.status(403).json({ 
          message: 'Access denied',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ message: 'Authorization check failed' });
    }
  };
};

// Error handling middleware
export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('API Error:', {
    path: req.path,
    method: req.method,
    error: error.message,
    stack: error.stack,
    user: req.user?.id
  });
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      details: error.message
    });
  }
  
  if (error.code === 'ECONNREFUSED') {
    return res.status(503).json({
      message: 'Database connection error'
    });
  }
  
  // Default error response
  const isDevelopment = config.NODE_ENV === 'development';
  res.status(error.status || 500).json({
    message: isDevelopment ? error.message : 'Internal server error',
    ...(isDevelopment && { stack: error.stack })
  });
};

// Async handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// CORS middleware for API routes
export const cors = (req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = config.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:5000', 'http://localhost:3000'];
  
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
};

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  if (config.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      user: req.user?.id || 'anonymous',
      ip: req.ip
    };
    
    console.log(`[API] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    
    // Log errors and slow requests
    if (res.statusCode >= 400 || duration > 1000) {
      console.warn('API Warning:', logData);
    }
  });
  
  next();
}; 