import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { pool } from "./db";

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

// Fix CORS for proper cookie handling
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Expose-Headers', 'Set-Cookie');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Set up session handling with stable configuration
app.use(session({
  store: new PgSession({
    pool,
    tableName: 'user_sessions',
    createTableIfMissing: true,
  }),
  secret: 'farm-produce-marketplace-secret-key-2024',
  resave: true, // Save session on every request to ensure persistence
  saveUninitialized: true, // Create sessions for unauthenticated users
  rolling: false,
  name: 'farmSessionId',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days for better persistence
    secure: false,
    httpOnly: true, // Security best practice
    sameSite: 'lax',
    path: '/'
  }
}));

// Debug middleware for session tracking
app.use((req, res, next) => {
  if (req.path.includes('/api/auth/')) {
    console.log(`[${req.method}] ${req.path} - Session ID: ${req.sessionID}, User ID: ${req.session.userId}`);
  }
  next();
});

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

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
