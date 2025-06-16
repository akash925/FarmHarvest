import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { pool } from "./db";
import { configurePassport, setupAuthRoutes } from "./auth";
import { config } from "./config";

// Extend express-session with our custom properties
declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

// Extend Express Request type to include session
declare global {
  namespace Express {
    interface Request {
      session: session.Session & Partial<session.SessionData>;
    }
  }
}

// Initialize connect-pg-simple with pg pool
const PgSession = pgSession(session);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up proper session handling with PostgreSQL store
app.use(session({
  store: new PgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true,
  }),
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false, // Only save sessions with data
  name: 'farmSessionId',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    secure: config.NODE_ENV === 'production', // HTTPS in production
    httpOnly: true, // Prevent XSS
    sameSite: 'lax' // CSRF protection
  }
}));

// Configure passport for authentication
configurePassport();

// Request logging middleware for API endpoints
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  if (config.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Global error handler
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error handler:', err);
  
  const isDevelopment = config.NODE_ENV === 'development';
  const status = err.status || err.statusCode || 500;
  
  if (res.headersSent) {
    return next(err);
  }

  res.status(status).json({ 
    message: isDevelopment ? err.message : 'Internal Server Error',
    ...(isDevelopment && { stack: err.stack })
  });
};

(async () => {
  try {
    // Setup authentication routes
    setupAuthRoutes(app);
    
    const server = await registerRoutes(app);

    // Apply global error handler
    app.use(errorHandler);

    // Setup Vite in development or serve static files in production
    if (config.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Start server
    const port = config.PORT;
    server.listen(port, () => {
      log(`🚀 FarmDirect server running on http://localhost:${port} in ${config.NODE_ENV} mode`);
      log(`🔐 Authentication: Local${config.FACEBOOK_APP_ID ? ', Facebook' : ''}${config.INSTAGRAM_CLIENT_ID ? ', Instagram' : ''}`);
      log(`💾 Database: ${config.DATABASE_URL ? 'Connected' : 'Not configured'}`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        log('Process terminated');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
