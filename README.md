# FarmDirect - Local Farm Produce Marketplace

FarmDirect is a full-stack web application that connects local farmers with consumers, enabling them to buy and sell fresh produce directly. The platform also supports farm space leasing, creating a comprehensive two-way marketplace for agricultural communities.

## 🚀 Features

### For Buyers
- **Browse Local Produce**: Search and filter fresh produce by location, category, and price
- **Direct Farmer Connection**: Message farmers directly for questions or custom orders
- **Location-Based Search**: Find farmers and produce near you using ZIP code search
- **Secure Checkout**: Integrated payment processing with Stripe
- **Order Management**: Track orders and view purchase history
- **Farm Space Leasing**: Rent growing space from local farmers

### For Farmers/Sellers
- **Product Catalog**: Create and manage listings with photos, descriptions, and pricing
- **Inventory Management**: Track quantities and update availability
- **Enhanced Profiles**: Showcase your farm with photos, videos, and social media links
- **Farm Space Sharing**: List available growing space for rent
- **Direct Communication**: Message system for customer inquiries
- **Order Fulfillment**: Manage orders and track sales

### Platform Features
- **Two-Way Marketplace**: Easy transition from buyer to seller
- **Authentication**: Email/password with optional social login (Facebook, Instagram)
- **Responsive Design**: Mobile-friendly interface
- **Real-time Messaging**: Direct communication between users
- **Interactive Map**: Visual location-based browsing
- **Search & Filtering**: Advanced filtering by location, category, and price

## 🏗️ Architecture

### Technology Stack

**Frontend**
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Radix UI for components
- Wouter for routing
- TanStack Query for state management
- React Hook Form for form handling
- Zod for validation

**Backend**
- Node.js with Express
- TypeScript
- PostgreSQL with Neon serverless
- Drizzle ORM
- Passport.js for authentication
- Express Session with PostgreSQL store
- Stripe for payments
- Bcrypt for password hashing

**Infrastructure**
- Session-based authentication
- Database session storage
- File upload support
- Rate limiting
- Security headers
- Environment-based configuration

### Database Schema

The application uses a relational database with the following key entities:

- **Users**: Core user information and authentication
- **Listings**: Product listings with pricing and availability
- **Orders**: Purchase transactions and order management
- **Reviews**: User feedback and ratings
- **Seller Profiles**: Enhanced farmer profiles with media
- **Farm Spaces**: Available growing space for rent
- **Messages**: Direct communication between users

## 🛠️ Setup and Installation

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or Neon serverless)
- Stripe account (for payments)
- Optional: Facebook/Instagram app credentials

### Environment Configuration

Create a `.env` file in the root directory with the following variables:

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/farmdirect

# Session
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# OAuth (Optional)
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret

# Email (Optional)
SENDGRID_API_KEY=your_sendgrid_api_key

# Stripe (Optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# App Configuration
NODE_ENV=development
PORT=5000
```

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd farmdirect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   # Push database schema
   npm run db:push
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5000`

## 📁 Project Structure

```
farmdirect/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   └── main.tsx       # App entry point
│   └── index.html
├── server/                # Backend Express application
│   ├── auth.ts           # Authentication logic
│   ├── config.ts         # Environment configuration
│   ├── db.ts             # Database connection
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   └── storage.ts        # Database operations
├── shared/               # Shared code between client/server
│   └── schema.ts         # Database schema and types
└── README.md
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes

### Code Quality

The project uses:
- TypeScript for type safety
- Zod for runtime validation
- ESLint for linting
- Prettier for code formatting (recommended)

### Database Management

The application uses Drizzle ORM with PostgreSQL. Schema changes should be made in `shared/schema.ts` and pushed using:

```bash
npm run db:push
```

## 🔐 Authentication

The application supports multiple authentication methods:

1. **Email/Password**: Default authentication with secure password hashing
2. **Facebook OAuth**: Optional social login (requires app credentials)
3. **Instagram OAuth**: Optional social login (requires app credentials)

Sessions are stored in PostgreSQL for scalability and persistence.

## 💳 Payments

Stripe integration is optional but recommended for production use. Configure your Stripe keys in the environment variables to enable:

- Secure payment processing
- Order management
- Receipt generation
- Refund handling

## 📱 API Endpoints

### Authentication
- `POST /api/auth/signin` - Sign in with email/password
- `POST /api/auth/signup` - Create new account
- `GET /api/auth/session` - Get current session
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/facebook` - Facebook OAuth
- `GET /api/auth/instagram` - Instagram OAuth

### Listings
- `GET /api/listings` - Get all listings
- `POST /api/listings` - Create new listing
- `GET /api/listings/:id` - Get listing details
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `PUT /api/orders/:id` - Update order status

## 🚀 Deployment

### Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   Ensure all required environment variables are set for production

3. **Start the production server**
   ```bash
   npm start
   ```

### Environment Considerations

- Set `NODE_ENV=production`
- Use secure session secrets
- Configure HTTPS in production
- Set up proper database connection pooling
- Configure rate limiting for API endpoints

## 🔒 Security

The application implements several security measures:

- **Authentication**: Secure session-based authentication
- **Password Security**: Bcrypt hashing with salt rounds
- **Session Management**: PostgreSQL-backed sessions with secure cookies
- **Input Validation**: Zod schema validation on all inputs
- **Rate Limiting**: Configurable rate limiting for API endpoints
- **Security Headers**: HSTS, XSS protection, and content type sniffing prevention
- **CSRF Protection**: SameSite cookie configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Use TypeScript for all new code
- Follow the existing code style and patterns
- Add proper error handling and validation
- Write tests for new features
- Update documentation as needed

## 📞 Support

For questions or support:

1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by the need to connect local farmers with consumers
- Thanks to the open-source community for the amazing tools and libraries

---

**Happy farming! 🌱** 