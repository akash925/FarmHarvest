import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
// @ts-ignore
import { Strategy as FacebookStrategy } from 'passport-facebook';
// @ts-ignore
import { Strategy as InstagramStrategy } from 'passport-instagram';
import bcrypt from 'bcrypt';
import { storage } from './storage';
import { config, features } from './config';
import type { Express } from 'express';
import { z } from 'zod';

// Validation schemas
const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  zip: z.string().min(5, 'ZIP code must be at least 5 characters'),
});

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Configure passport strategies
export function configurePassport() {
  // Local Strategy (email/password)
  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        // For existing users, check password
        if (user.password) {
          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            return done(null, false, { message: 'Invalid email or password' });
          }
        } else {
          return done(null, false, { message: 'Invalid email or password' });
        }

        return done(null, user);
      } catch (error) {
        console.error('Local authentication error:', error);
        return done(error);
      }
    }
  ));

  // Facebook Strategy (only if configured)
  if (features.facebookAuth) {
    passport.use(new FacebookStrategy({
      clientID: config.FACEBOOK_APP_ID!,
      clientSecret: config.FACEBOOK_APP_SECRET!,
      callbackURL: "/api/auth/facebook/callback",
      profileFields: ['id', 'displayName', 'email', 'photos']
    }, async (accessToken: any, refreshToken: any, profile: any, done: any) => {
      try {
        // Check if user exists with Facebook ID
        let user = await storage.getUserByAuthId('facebook', profile.id);
        
        if (!user) {
          // Check if user exists with same email
          const email = profile.emails?.[0]?.value;
          if (email) {
            user = await storage.getUserByEmail(email);
            if (user) {
              // Update existing user with Facebook info
              user = await storage.updateUser(user.id, {
                authType: 'facebook',
                authId: profile.id,
                image: profile.photos?.[0]?.value || user.image,
              });
            }
          }
          
          if (!user) {
            // Create new user
            user = await storage.createUser({
              name: profile.displayName || 'Facebook User',
              email: email || `facebook_${profile.id}@temp.com`,
              image: profile.photos?.[0]?.value,
              authType: 'facebook',
              authId: profile.id,
            });
          }
        } else {
          // Update existing Facebook user
          const email = profile.emails?.[0]?.value;
          if (email && email !== user.email) {
            user = await storage.updateUser(user.id, {
              email: email,
              image: profile.photos?.[0]?.value || user.image,
            });
          }
        }

        return done(null, user);
      } catch (error) {
        console.error('Facebook authentication error:', error);
        return done(error);
      }
    }));
  }

  // Instagram Strategy (only if configured)
  if (features.instagramAuth) {
    passport.use(new InstagramStrategy({
      clientID: config.INSTAGRAM_CLIENT_ID!,
      clientSecret: config.INSTAGRAM_CLIENT_SECRET!,
      callbackURL: "/api/auth/instagram/callback"
    }, async (accessToken: any, refreshToken: any, profile: any, done: any) => {
      try {
        // Check if user exists with Instagram ID
        let user = await storage.getUserByAuthId('instagram', profile.id);
        
        if (!user) {
          // Create new user
          user = await storage.createUser({
            name: profile.displayName || profile.username || 'Instagram User',
            email: `instagram_${profile.id}@temp.com`,
            image: profile._json?.profile_picture,
            authType: 'instagram',
            authId: profile.id,
          });
        }

        return done(null, user);
      } catch (error) {
        console.error('Instagram authentication error:', error);
        return done(error);
      }
    }));
  }

  // Serialize/deserialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user);
    } catch (error) {
      console.error('User deserialization error:', error);
      done(error, null);
    }
  });
}

// Authentication middleware
export function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  return res.status(401).json({ message: 'Authentication required' });
}

// Optional authentication middleware (doesn't block if not authenticated)
export function optionalAuth(req: any, res: any, next: any) {
  // Just continue - user will be available in req.user if authenticated
  next();
}

// Authentication routes
export function setupAuthRoutes(app: Express) {
  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Local authentication routes
  app.post('/api/auth/signin', async (req, res, next) => {
    try {
      // Validate input
      const validatedData = signInSchema.parse(req.body);
      
      passport.authenticate('local', (err: any, user: any, info: any) => {
        if (err) {
          console.error('Authentication error:', err);
          return res.status(500).json({ message: 'Authentication error' });
        }
        if (!user) {
          return res.status(401).json({ message: info?.message || 'Invalid credentials' });
        }
        
        req.logIn(user, (err) => {
          if (err) {
            console.error('Session error:', err);
            return res.status(500).json({ message: 'Session error' });
          }
          
          // Ensure session is saved
          req.session.userId = user.id;
          req.session.save((err) => {
            if (err) {
              console.error('Session save error:', err);
            }
            res.json({ 
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                zip: user.zip,
                about: user.about,
                productsGrown: user.productsGrown,
                authType: user.authType
              }
            });
          });
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error',
          errors: error.errors 
        });
      }
      console.error('Sign in error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/auth/signup', async (req, res) => {
    try {
      // Validate input
      const validatedData = signUpSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 12);

      // Create user
      const user = await storage.createUser({
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        zip: validatedData.zip,
        authType: 'local',
        authId: validatedData.email,
      });

      // Log in the user
      req.logIn(user, (err) => {
        if (err) {
          console.error('Session error after signup:', err);
          return res.status(500).json({ message: 'Account created but session error occurred' });
        }
        
        req.session.userId = user.id;
        req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
          }
          res.status(201).json({ 
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
              zip: user.zip,
              about: user.about,
              productsGrown: user.productsGrown,
              authType: user.authType
            }
          });
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error',
          errors: error.errors 
        });
      }
      console.error('Sign up error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // DISABLED: Duplicate session handler - using unified handler in routes.ts instead
  // app.get('/api/auth/session', (req, res) => {
  //   if (req.isAuthenticated() && req.user) {
  //     const user = req.user as any;
  //     res.json({ 
  //       user: {
  //         id: user.id,
  //         name: user.name,
  //         email: user.email,
  //         image: user.image,
  //         zip: user.zip,
  //         about: user.about,
  //         productsGrown: user.productsGrown,
  //         authType: user.authType
  //       }
  //     });
  //   } else {
  //     res.status(401).json({ message: 'Not authenticated' });
  //   }
  // });

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Logout error' });
      }
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
          return res.status(500).json({ message: 'Session destroy error' });
        }
        res.clearCookie('farmSessionId');
        res.json({ message: 'Logged out successfully' });
      });
    });
  });

  // Facebook OAuth routes (only if enabled)
  if (features.facebookAuth) {
    app.get('/api/auth/facebook', 
      passport.authenticate('facebook', { scope: ['email'] })
    );
    
    app.get('/api/auth/facebook/callback',
      passport.authenticate('facebook', { failureRedirect: '/login?error=facebook' }),
      (req, res) => {
        res.redirect('/?login=success');
      }
    );
  } else {
    app.get('/api/auth/facebook', (req, res) => {
      res.status(501).json({ message: 'Facebook login not configured' });
    });
  }

  // Instagram OAuth routes (only if enabled)
  if (features.instagramAuth) {
    app.get('/api/auth/instagram', 
      passport.authenticate('instagram')
    );
    
    app.get('/api/auth/instagram/callback',
      passport.authenticate('instagram', { failureRedirect: '/login?error=instagram' }),
      (req, res) => {
        res.redirect('/?login=success');
      }
    );
  } else {
    app.get('/api/auth/instagram', (req, res) => {
      res.status(501).json({ message: 'Instagram login not configured' });
    });
  }
}