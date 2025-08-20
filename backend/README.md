# Smart Helpdesk Backend

A robust Node.js/Express backend with MongoDB, JWT authentication, and role-based access control.

## Features

- **Express.js Server** with comprehensive middleware
- **MongoDB Integration** with Mongoose ODM
- **JWT Authentication** with secure token management
- **Role-based Access Control** (User/Admin)
- **Password Security** with bcrypt hashing
- **Input Validation** and error handling
- **RESTful API** design
- **Environment Configuration** with dotenv

## Project Structure

```
backend/
├── models/              # Mongoose schemas
│   └── User.js         # User model with validation
├── routes/              # API route definitions
│   ├── auth.routes.js  # Authentication routes
│   └── admin.routes.js # Admin-only routes
├── controllers/         # Route handlers
│   └── auth.controller.js # Auth logic
├── middlewares/         # Custom middleware
│   └── auth.middleware.js # JWT & role verification
├── utils/               # Utility functions
│   ├── db.js           # Database connection
│   └── jwt.js          # JWT utilities
├── server.js            # Express server entry point
├── package.json         # Dependencies
└── .env                 # Environment variables
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=8080
NODE_ENV=development

# MongoDB Connection
MONGO_URI=mongodb://127.0.0.1:27017/smart-helpdesk

# JWT Configuration
JWT_SECRET=your_super_secret_key_here_change_this_in_production

# Optional: CORS Origins
CORS_ORIGIN=http://localhost:5173
```

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | User registration | No |
| POST | `/login` | User login | No |
| GET | `/profile` | Get user profile | Yes |

### Admin Routes (`/api/admin`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/users` | Get all users | Yes | Admin |
| GET | `/users/:id` | Get user by ID | Yes | Admin |
| PATCH | `/users/:id/role` | Update user role | Yes | Admin |
| PATCH | `/users/:id/status` | Toggle user status | Yes | Admin |
| GET | `/stats` | System statistics | Yes | Admin |

### Public Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |

## User Model Schema

```javascript
{
  name: String,           // Required, 2-50 chars
  email: String,          // Required, unique, validated
  passwordHash: String,   // Required, bcrypt hashed
  role: String,           // 'user' or 'admin', default: 'user'
  isActive: Boolean,      // Account status, default: true
  lastLogin: Date,        // Last login timestamp
  createdAt: Date,        // Auto-generated
  updatedAt: Date         // Auto-generated
}
```

## Authentication Flow

1. **Registration**: User provides name, email, password
   - Password is hashed with bcrypt (salt rounds: 12)
   - JWT token is generated and returned
   - User data is stored in MongoDB

2. **Login**: User provides email and password
   - Password is verified against stored hash
   - JWT token is generated and returned
   - Last login timestamp is updated

3. **Protected Routes**: Include JWT in Authorization header
   - Format: `Bearer <token>`
   - Token is verified and user data is attached to `req.user`

## Role-based Access Control

### Middleware Functions

- `auth`: Verifies JWT token
- `requireRole(roles)`: Checks if user has required role(s)
- `requireAdmin`: Admin-only access
- `requireUserOrAdmin`: User or Admin access

### Usage Examples

```javascript
// Admin-only route
router.get('/admin/users', auth, requireAdmin, getUsers);

// Role-specific route
router.get('/users', auth, requireRole(['user', 'admin']), getUsers);

// Custom role requirement
router.get('/moderator', auth, requireRole('moderator'), moderatorAction);
```

## Error Handling

All API responses include:
- `message`: Human-readable error description
- `error`: Machine-readable error code
- `details`: Additional error information (when applicable)

### Common Error Codes

- `MISSING_FIELDS`: Required fields not provided
- `VALIDATION_ERROR`: Input validation failed
- `EMAIL_EXISTS`: Email already registered
- `INVALID_CREDENTIALS`: Login failed
- `NO_TOKEN`: JWT token missing
- `INVALID_TOKEN`: JWT token invalid/expired
- `INSUFFICIENT_PERMISSIONS`: Role access denied
- `USER_NOT_FOUND`: User doesn't exist

## Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Input Validation**: Comprehensive field validation
- **Role-based Access**: Granular permission control
- **CORS Protection**: Configurable cross-origin settings
- **Rate Limiting**: Built-in Express rate limiting
- **SQL Injection Protection**: Mongoose ODM protection

## Database Indexes

- `email`: Unique index for fast email lookups
- `role`: Index for role-based queries
- `createdAt`: Index for chronological sorting

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Create Environment File**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Start Production Server**:
   ```bash
   npm start
   ```

## Development Scripts

- `npm run dev`: Start with nodemon (auto-restart)
- `npm start`: Start production server
- `npm test`: Run tests (when implemented)

## Testing the API

### Health Check
```bash
curl http://localhost:8080/health
```

### User Registration
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

### User Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Get Profile (with JWT)
```bash
curl -X GET http://localhost:8080/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT implementation
- **bcryptjs**: Password hashing
- **dotenv**: Environment configuration
- **cors**: Cross-origin resource sharing
- **morgan**: HTTP request logging
- **cookie-parser**: Cookie parsing
- **nodemon**: Development auto-restart

## License

ISC
