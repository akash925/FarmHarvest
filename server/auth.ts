import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
// @ts-ignore
import { Strategy as FacebookStrategy } from 'passport-facebook';
// @ts-ignore
import { Strategy as InstagramStrategy } from 'passport-instagram';
import bcrypt from 'bcrypt';
import { storage } from './storage';
import type { Express } from 'express';

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
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));

  // Facebook Strategy
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
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
          } else {
            // Link existing user to Facebook
            await storage.updateUser(user.id, {
              authType: 'facebook',
              authId: profile.id,
              image: profile.photos?.[0]?.value || user.image,
            });
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }));
  }

  // Instagram Strategy
  if (process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET) {
    passport.use(new InstagramStrategy({
      clientID: process.env.INSTAGRAM_CLIENT_ID,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
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
      done(error, null);
    }
  });
}

// Authentication routes
export function setupAuthRoutes(app: Express) {
  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Local authentication routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { name, email, password, zip } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createUser({
        name,
        email,
        password: hashedPassword,
        zip,
        authType: 'email',
        authId: email,
      });

      // Log in user
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Login failed after signup' });
        }
        res.json({ user: { ...user, password: undefined } });
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Signup failed' });
    }
  });

  app.post('/api/auth/signin', (req, res, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || 'Login failed' });
      }
      
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        res.json({ user: { ...user, password: undefined } });
      });
    })(req, res, next);
  });

  // Facebook authentication routes
  app.get('/api/auth/facebook',
    passport.authenticate('facebook', { scope: ['email'] })
  );

  app.get('/api/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect('/');
    }
  );

  // Instagram authentication routes
  app.get('/api/auth/instagram',
    passport.authenticate('instagram')
  );

  app.get('/api/auth/instagram/callback',
    passport.authenticate('instagram', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect('/');
    }
  );

  // Session management
  app.get('/api/auth/session', (req, res) => {
    if (req.isAuthenticated() && req.user) {
      res.json({ user: { ...req.user, password: undefined } });
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });
}