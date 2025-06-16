# FarmDirect API Documentation

## Authentication

All authenticated endpoints require a valid session. Authentication is handled via HTTP-only cookies.

### POST /api/auth/signup
Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "password123",
  "zip": "12345"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "zip": "12345",
    "authType": "local"
  }
}
```

### POST /api/auth/signin
Sign in with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "zip": "12345",
    "authType": "local"
  }
}
```

### GET /api/auth/session
Get current user session.

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "zip": "12345",
    "authType": "local"
  }
}
```

### POST /api/auth/logout
Sign out and destroy session.

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

## Listings

### GET /api/listings
Get all listings with optional filtering.

**Query Parameters:**
- `category` (optional): Filter by category
- `zip` (optional): Filter by ZIP code
- `search` (optional): Search in title and description

**Response:**
```json
{
  "listings": [
    {
      "id": 1,
      "title": "Fresh Organic Tomatoes",
      "category": "vegetables",
      "description": "Locally grown organic tomatoes",
      "price": 599,
      "unit": "pound",
      "quantity": 50,
      "imageUrl": "https://example.com/tomatoes.jpg",
      "userId": 2,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### POST /api/listings
Create a new listing. **Requires Authentication**

**Request Body:**
```json
{
  "title": "Fresh Organic Tomatoes",
  "category": "vegetables", 
  "description": "Locally grown organic tomatoes",
  "price": 599,
  "unit": "pound",
  "quantity": 50,
  "imageUrl": "https://example.com/tomatoes.jpg"
}
```

### GET /api/listings/:id
Get a specific listing by ID.

### PUT /api/listings/:id
Update a listing. **Requires Authentication and Ownership**

### DELETE /api/listings/:id
Delete a listing. **Requires Authentication and Ownership**

## User Profiles

### GET /api/users/:id
Get user profile information.

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "zip": "12345",
    "about": "Local farmer specializing in organic vegetables",
    "productsGrown": "Tomatoes, Lettuce, Carrots"
  }
}
```

### PUT /api/users/:id
Update user profile. **Requires Authentication and Ownership**

## Seller Profiles

### GET /api/seller-profiles/:userId
Get enhanced seller profile.

**Response:**
```json
{
  "profile": {
    "id": 1,
    "userId": 2,
    "farmName": "Green Valley Farm",
    "bio": "Family-owned organic farm since 1975",
    "address": "123 Farm Road, Rural County",
    "phone": "555-123-4567",
    "operationalHours": {
      "monday": "8:00-17:00",
      "tuesday": "8:00-17:00"
    }
  },
  "media": [
    {
      "id": 1,
      "mediaType": "photo",
      "mediaUrl": "https://example.com/farm.jpg",
      "caption": "Our main greenhouse"
    }
  ],
  "farmSpaces": [],
  "user": {},
  "listings": []
}
```

### POST /api/seller-profiles
Create seller profile. **Requires Authentication**

### PATCH /api/seller-profiles/:userId
Update seller profile. **Requires Authentication and Ownership**

## Farm Spaces

### GET /api/farm-spaces/available
Get all available farm spaces for rent.

### GET /api/farm-spaces/user/:userId
Get farm spaces owned by a specific user.

### POST /api/farm-spaces
Create a new farm space listing. **Requires Authentication**

**Request Body:**
```json
{
  "farmSpace": {
    "title": "Sunny Garden Plot",
    "description": "200 sq ft plot with excellent drainage",
    "sizeSqft": 200,
    "pricePerMonth": 5000,
    "soilType": "Loamy",
    "lightConditions": "Full Sun",
    "waterAccess": true,
    "greenhouseAccess": false,
    "toolStorage": true,
    "availableFrom": "2024-03-01",
    "availableUntil": "2024-11-30"
  }
}
```

## Orders

### GET /api/orders
Get orders for current user. **Requires Authentication**

### POST /api/orders
Create a new order. **Requires Authentication**

**Request Body:**
```json
{
  "listingId": 1,
  "quantity": 5,
  "totalPrice": 2995
}
```

### PUT /api/orders/:id/status
Update order status. **Requires Authentication and Ownership**

## Messages

### GET /api/messages
Get messages for current user. **Requires Authentication**

### POST /api/messages
Send a message. **Requires Authentication**

**Request Body:**
```json
{
  "recipientId": 2,
  "subject": "Question about tomatoes",
  "message": "Are these tomatoes still available?",
  "farmSpaceId": 1
}
```

### PUT /api/messages/:id/read
Mark message as read. **Requires Authentication**

## Reviews

### GET /api/reviews/seller/:sellerId
Get reviews for a seller.

### POST /api/reviews
Create a review. **Requires Authentication**

**Request Body:**
```json
{
  "orderId": 1,
  "rating": 5,
  "comment": "Excellent quality tomatoes!",
  "imageUrl": "https://example.com/review.jpg"
}
```

## Payments

### POST /api/create-payment-intent
Create Stripe payment intent. **Requires Authentication**

**Request Body:**
```json
{
  "listingId": 1,
  "quantity": 5,
  "amount": 2995
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxxxx_secret_xxxxx"
}
```

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "message": "Authentication required",
  "code": "AUTH_REQUIRED"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied",
  "code": "INSUFFICIENT_PERMISSIONS"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "message": "Too many requests",
  "retryAfter": 60
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

## Rate Limiting

API endpoints are rate limited to prevent abuse:
- **Window**: 15 minutes
- **Limit**: 100 requests per window per IP
- **Headers**: Rate limit information is included in response headers

## Data Types

### Price
All prices are stored as integers in cents (USD).
- Example: $5.99 = 599 cents

### Dates
All dates are in ISO 8601 format.
- Example: "2024-01-15T10:00:00Z"

### Images
Image URLs should be HTTPS and point to valid image files (JPEG, PNG, WebP).

## Authentication Flow

1. User signs up with email/password
2. Session cookie is set automatically
3. Subsequent requests include session cookie
4. Session expires after 7 days of inactivity
5. User can logout to destroy session immediately

## Best Practices

1. **Always handle errors**: Check response status codes
2. **Validate input**: Use the documented schemas
3. **Rate limiting**: Implement exponential backoff for retries
4. **Security**: Never expose sensitive data in client-side code
5. **Images**: Optimize images before uploading
6. **Pagination**: Use appropriate page sizes for list endpoints 