# Healthcare Management System - Backend API

A comprehensive Node.js backend API for a healthcare management system built with Express.js, Sequelize ORM, and PostgreSQL. This system supports three user roles: Admin, Doctor, and Patient, with role-based access control and appointment management.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Authentication & Authorization](#authentication--authorization)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Database Migrations & Seeders](#database-migrations--seeders)
- [Code Documentation](#code-documentation)
- [Security Features](#security-features)
- [Error Handling](#error-handling)

## 🏥 Overview

This backend API provides a complete healthcare management system with the following features:

- **User Management**: Registration, login, and profile management
- **Role-Based Access Control**: Admin, Doctor, and Patient roles with different permissions
- **Appointment System**: Booking, viewing, and managing medical appointments
- **JWT Authentication**: Secure token-based authentication
- **Database Management**: PostgreSQL with Sequelize ORM
- **Security**: Password hashing, CORS, Helmet security headers

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs, Helmet, CORS
- **Logging**: Morgan
- **Environment**: dotenv

## 📁 Project Structure

```
BE/
├── src/
│   ├── app.js                 # Express application setup
│   ├── config/
│   │   └── database.js        # Database configuration
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   ├── adminController.js # Admin-specific operations
│   │   ├── appointmentController.js # Appointment management
│   │   └── doctorController.js # Doctor-specific operations
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication middleware
│   │   └── rbac.js           # Role-based access control
│   ├── models/
│   │   ├── index.js          # Sequelize model loader
│   │   ├── user.js           # User model
│   │   └── appointment.js    # Appointment model
│   └── routes/
│       ├── authRoutes.js     # Authentication routes
│       ├── adminRoutes.js    # Admin routes
│       ├── appointmentRoutes.js # Appointment routes
│       └── doctorRoutes.js   # Doctor routes
├── migrations/               # Database migrations
├── seeders/                 # Database seeders
├── server.js               # Server entry point
└── package.json            # Dependencies and scripts
```

## 🗄 Database Schema

### Users Table
```sql
CREATE TABLE "Users" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR UNIQUE NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  role ENUM('admin', 'patient', 'doctor') NOT NULL DEFAULT 'patient',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Appointments Table
```sql
CREATE TABLE "Appointments" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patientId UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  doctorId UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  date DATE NOT NULL,
  time TIME NOT NULL,
  reason VARCHAR NOT NULL,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

## 🔗 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | User login | Public |
| GET | `/profile` | Get user profile | Private |

### Admin Routes (`/api/admin`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/dashboard` | Get dashboard statistics | Admin |
| GET | `/users` | Get all users | Admin |
| POST | `/users` | Create new user | Admin |
| DELETE | `/users/:userId` | Delete user | Admin |
| GET | `/appointments` | Get all appointments | Admin |
| PUT | `/appointments/:id/confirm` | Confirm appointment | Admin |
| PUT | `/appointments/:id/cancel` | Cancel appointment | Admin |

### Appointment Routes (`/api/appointments`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/` | Book new appointment | Patient |
| GET | `/mine` | Get my appointments | Patient |

### Doctor Routes (`/api/doctors`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | Get all doctors | Private |
| GET | `/appointments` | Get my appointments | Doctor |
| PUT | `/appointments/:id/cancel` | Cancel appointment | Doctor |

## 🔐 Authentication & Authorization

### JWT Token Structure
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "admin|doctor|patient",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Role Permissions

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, user management, appointment management |
| **Doctor** | View own appointments, cancel own appointments |
| **Patient** | Book appointments, view own appointments |

### Middleware Chain
1. **Authentication** (`authenticateToken`): Verifies JWT token
2. **Authorization** (`requireRole`): Checks user role permissions

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Health/BE
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb healthcare_db
   ```

5. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

6. **Seed the database**
   ```bash
   npm run db:seed
   ```

7. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=healthcare_db
DB_USER=your_username
DB_PASS=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## 🗃 Database Migrations & Seeders

### Available Scripts

```bash
# Create database
npm run db:create

# Run migrations
npm run db:migrate

# Run seeders
npm run db:seed

# Reset database (drop, create, migrate, seed)
npm run db:reset
```

### Demo Data

The system includes demo users for testing:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password123 |
| Doctor | doctor@example.com | password123 |
| Patient | patient@example.com | password123 |

## 📚 Code Documentation

### Key Files Explained

#### `server.js` - Server Entry Point
```javascript
// Key responsibilities:
// - Database connection authentication
// - Model synchronization (development only)
// - Server startup and graceful shutdown
// - Error handling for startup failures
```

#### `src/app.js` - Express Application Setup
```javascript
// Key features:
// - Security middleware (Helmet, CORS)
// - Request logging (Morgan)
// - Body parsing
// - Route mounting
// - Global error handling
```

#### `src/models/user.js` - User Model
```javascript
// Features:
// - Password hashing with bcrypt
// - Input validation
// - Role-based access
// - Secure JSON serialization
// - Instance methods for password validation
```

#### `src/middleware/auth.js` - Authentication Middleware
```javascript
// Functionality:
// - JWT token verification
// - User lookup and validation
// - Error handling for invalid/expired tokens
// - Request user attachment
```

#### `src/middleware/rbac.js` - Role-Based Access Control
```javascript
// Features:
// - Role validation
// - Permission checking
// - Predefined role combinations
// - Error handling for unauthorized access
```

### Controller Structure

Each controller follows a consistent pattern:

```javascript
const controllerFunction = async (req, res) => {
  try {
    // 1. Input validation
    // 2. Business logic
    // 3. Database operations
    // 4. Success response
  } catch (error) {
    // 1. Error logging
    // 2. Error type handling
    // 3. Error response
  }
};
```

## 🔒 Security Features

### Password Security
- **Hashing**: bcryptjs with salt rounds (10)
- **Validation**: Minimum 6 characters
- **Storage**: Never stored in plain text

### JWT Security
- **Secret Key**: Environment variable
- **Expiration**: Configurable (default 7 days)
- **Validation**: Token verification on each request

### API Security
- **CORS**: Configured for frontend origin
- **Helmet**: Security headers
- **Input Validation**: Sequelize model validation
- **SQL Injection**: Protected by Sequelize ORM

### Access Control
- **Authentication**: Required for protected routes
- **Authorization**: Role-based permissions
- **Self-Protection**: Users cannot delete themselves

## ⚠ Error Handling

### Error Types Handled

1. **Validation Errors**
   ```javascript
   // SequelizeValidationError
   // Returns 400 with validation messages
   ```

2. **Authentication Errors**
   ```javascript
   // Invalid/expired tokens
   // Returns 401 Unauthorized
   ```

3. **Authorization Errors**
   ```javascript
   // Insufficient permissions
   // Returns 403 Forbidden
   ```

4. **Not Found Errors**
   ```javascript
   // Resource not found
   // Returns 404 Not Found
   ```

5. **Server Errors**
   ```javascript
   // Unexpected errors
   // Returns 500 Internal Server Error
   ```

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"] // Optional
}
```

## 🧪 Testing the API

### Health Check
```bash
curl http://localhost:5000/api/health
```

### User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "role": "patient"
  }'
```

### User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### Protected Route (with JWT)
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

## 🔄 Database Relationships

### User-Appointment Relationships
- **One-to-Many**: User (Patient) → Appointments
- **One-to-Many**: User (Doctor) → Appointments
- **Many-to-Many**: Through Appointments table

### Foreign Key Constraints
- **CASCADE DELETE**: When user is deleted, their appointments are deleted
- **CASCADE UPDATE**: When user ID changes, appointment references update

## 🚀 Deployment Considerations

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secret
- [ ] Configure PostgreSQL SSL
- [ ] Set up proper logging
- [ ] Configure CORS for production domain
- [ ] Use environment variables for all secrets
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Set up monitoring and health checks

### Environment-Specific Configurations

#### Development
- Model synchronization enabled
- Detailed error messages
- Console logging enabled

#### Production
- Model synchronization disabled
- Generic error messages
- Minimal logging
- SSL database connections

## 📞 Support

For questions or issues:
1. Check the error logs
2. Verify environment variables
3. Ensure database is running
4. Check JWT token validity
5. Verify user permissions

## 📄 License

This project is licensed under the ISC License.

---

**Note**: This backend API is designed to work with the corresponding frontend application. Make sure to configure the `FRONTEND_URL` environment variable correctly for CORS to work properly.