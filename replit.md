# FarmDirect - Local Farm Produce Marketplace

## Overview

FarmDirect is a full-stack web application that connects local farmers and gardeners with consumers, enabling direct-to-consumer sales of fresh produce. The platform facilitates discovery, purchasing, and pickup coordination for local farm products, creating a community-driven marketplace for fresh, homegrown food.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: React Query (TanStack Query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **Build Tool**: Vite for development and production builds
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: Express sessions with PostgreSQL storage
- **Real-time Communication**: WebSocket integration for messaging
- **Payment Processing**: Stripe integration for secure transactions

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Session Store**: PostgreSQL-backed session storage using connect-pg-simple
- **Schema Management**: Drizzle Kit for migrations and schema evolution

## Key Components

### Authentication & Authorization
- Session-based authentication using express-session
- Custom authentication provider with React Context
- Support for multiple auth types (email/password, potential OAuth)
- Session persistence across browser refreshes
- Protected routes with authentication guards

### Core Business Logic
- **User Management**: User registration, profiles, and seller profiles
- **Listing Management**: Product listings with categories, pricing, and inventory
- **Order Processing**: Order creation, payment processing, and status tracking
- **Review System**: Post-purchase reviews and ratings
- **Messaging System**: Real-time messaging between buyers and sellers
- **Farm Spaces**: Rentable farm space listings for community gardening

### User Interface Components
- Responsive design with mobile-first approach
- Interactive map integration using Leaflet for location-based searches
- Form components with comprehensive validation
- Modal dialogs and toast notifications
- Image upload and display capabilities
- Search and filtering functionality

## Data Flow

### User Authentication Flow
1. User submits credentials via login/signup forms
2. Server validates credentials and creates session
3. Session ID stored in HTTP-only cookie
4. Frontend auth context provides user state throughout app
5. Protected routes redirect unauthenticated users to login

### Listing and Purchase Flow
1. Authenticated users create product listings
2. Buyers search and filter listings by location/category
3. Purchase initiated through Stripe payment integration
4. Order created with "pending" status
5. Payment confirmation updates order to "paid"
6. Buyer and seller coordinate pickup via messaging system
7. Order marked as "completed" after pickup

### Real-time Messaging
1. WebSocket connection established on message page load
2. Users join rooms based on user ID
3. Messages broadcast to relevant participants
4. Message persistence through PostgreSQL storage
5. Real-time updates for new messages and read status

## External Dependencies

### Payment Processing
- **Stripe**: Complete payment processing solution
- Payment intents for secure card processing
- Webhook handling for payment confirmations
- Platform fee collection (15% commission)

### Database & Infrastructure
- **Neon PostgreSQL**: Serverless PostgreSQL database
- **Replit**: Development and deployment platform
- Connection pooling via @neondatabase/serverless

### UI & Mapping
- **Radix UI**: Accessible component primitives
- **Leaflet**: Interactive maps for location-based features
- **Lucide React**: Icon library
- **React Helmet**: SEO and meta tag management

### Email Services
- **SendGrid**: Email delivery service (configured but not actively used)

## Deployment Strategy

### Development Environment
- Replit-based development with hot reloading
- Vite dev server for frontend with Express API proxy
- PostgreSQL module for database access
- Environment variables for API keys and database URLs

### Production Build
- Vite builds frontend to `dist/public`
- ESBuild bundles server code to `dist/index.js`
- Static file serving through Express
- Session-based authentication with secure cookies

### Database Management
- Drizzle Kit for schema migrations
- Database connection through Neon serverless
- Automatic connection pooling and management

## Changelog
- June 14, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.