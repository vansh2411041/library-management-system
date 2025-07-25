# Library Management System

A comprehensive full-stack web application for managing library operations with user authentication, book borrowing, and administrative controls built with React, Node.js, and MySQL.

## Overview

This Library Management System provides a complete digital solution for libraries to manage their book inventory, user accounts, and borrowing operations. The system features separate interfaces for library members and administrators, with secure authentication, real-time data management, and a MySQL database backend.

## Key Features

### User Management
- Secure user registration and authentication with JWT-based tokens
- Protected admin registration using secret codes with environment variable security
- Encrypted password storage with bcrypt hashing
- Role-based access control separating users and administrators
- Password reset functionality for administrators
- Admin can reset user passwords when needed

### Book Management System
- Complete book catalog with search and filtering capabilities
- Book borrowing system with automatic due date calculation (14-day loan period)
- Return system with overdue tracking and notifications
- Full CRUD operations for administrators to manage inventory
- Real-time availability tracking and statistics
- Book categories and author management

### Administrative Dashboard
- Comprehensive system overview with key metrics and statistics
- Complete user management with account oversight
- Active loan monitoring with overdue notifications
- Detailed borrowing history and analytics
- User password reset capabilities for support
- Real-time dashboard with books, members, and loan statistics

### Security Features
- Environment variables for sensitive data protection
- Secure password storage with bcrypt encryption
- Protected API routes with authentication middleware
- Secret code validation for admin registration
- CORS configuration for cross-origin requests
- JWT token-based authentication system

## Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and optimized building
- **Tailwind CSS** for responsive and modern styling
- **React Router** for client-side navigation
- **Axios** for HTTP requests and API communication
- **Lucide React** for consistent iconography

### Backend
- **Node.js** with Express.js framework
- **MySQL** database with connection pooling for performance
- **JWT (JSON Web Tokens)** for secure authentication
- **bcrypt** for password hashing and security
- **express-validator** for input validation
- **CORS** middleware for cross-origin request handling
- **dotenv** for environment variable management

### Database
- **MySQL** relational database with proper normalization
- Tables: Books, Members, Admins, Authors, Categories, Loans
- Referential integrity and data consistency
- Connection pooling for optimal performance

## Installation and Setup

### Prerequisites
Before starting, ensure you have the following installed:
- Node.js (version 16 or higher)
- MySQL Server (version 8.0 or higher recommended)
- Git for version control
- A code editor (VS Code recommended)

### Database Setup
1. Create a new MySQL database:
CREATE DATABASE SimpleLibrary;
2. The application will create the required tables automatically on first run.

### Backend Configuration
1. Navigate to the backend directory:
   cd backend
2. Install required dependencies:
   npm install
3. Create environment configuration:
   cp .env.example .env
4. Edit the `.env` file with your database credentials:
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=SimpleLibrary
   JWT_SECRET=your_secure_jwt_secret_key_here
   ADMIN_SECRET_CODE=LIBRARY_ADMIN_2024
   PORT=5000
   NODE_ENV=development
5. Start the backend server:
   npm run dev
   
### Frontend Setup
1. From the project root directory:
   npm install
2. Start the development server:
   npm run dev

### Access Points
- Frontend Application: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure
```
library-management-system/
├── src/
│   ├── components/
│   │   ├── BookCard.tsx
│   │   ├── LoginForm.tsx
│   │   ├── UserDashboard.tsx
│   │   ├── ManagementDashboard.tsx
│   │   └── AdminRegistration.tsx
│   ├── services/
│   │   └── api.ts
│   ├── data/
│   │   └── mockData.ts
│   ├── types.ts
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── vite-env.d.ts
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── .env.example
│   └── node_modules/
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── .gitignore
└── README.md
```
```


## API Endpoints

### Authentication
- `POST /api/auth/login` - User/Admin login
- `POST /api/auth/register` - User registration
- `POST /api/auth/register-admin` - Admin registration with secret code

### Books Management
- `GET /api/books` - Get all books
- `POST /api/books` - Add new book (admin only)
- `PUT /api/books/:id` - Update book (admin only)
- `DELETE /api/books/:id` - Delete book (admin only)

### User Management
- `GET /api/members` - Get all members (admin only)
- `PUT /api/admin/users/:id/reset-password` - Reset user password (admin only)

### Loans Management
- `GET /api/loans` - Get all loans
- `POST /api/loans` - Create new loan
- `PUT /api/loans/:id/return` - Return book

## Usage Guide

### For Library Members
1. **Registration and Login**: Create a new account or sign in with existing credentials
2. **Browse Books**: Search and filter through the available book catalog
3. **Borrow Books**: Select and borrow available books with automatic due date assignment
4. **Manage Loans**: View current borrowed books, due dates, and borrowing history
5. **Return Books**: Mark books as returned when finished reading

### For Administrators
1. **Admin Registration**: Use the secret code `LIBRARY_ADMIN_2024` to create administrator accounts
2. **Dashboard Access**: View comprehensive system statistics and overview
3. **Book Management**: Add new books, edit existing entries, or remove books from the catalog
4. **User Management**: View all registered users and their borrowing activity
5. **Loan Oversight**: Monitor all active loans, overdue items, and borrowing patterns
6. **Password Management**: Reset user passwords when needed for account support

## Security Implementation

### Environment Variables
All sensitive data is stored in environment variables:
- Database credentials
- JWT secrets
- Admin secret codes
- Server configuration

### Password Security
- All passwords encrypted with bcrypt
- JWT tokens for session management
- Secure admin registration process

### API Security
- Protected routes with authentication middleware
- Input validation on all endpoints
- CORS configuration for secure requests

## Development

### Local Development
1. Ensure MySQL server is running
2. Start the backend server: `npm run dev` (in backend directory)
3. Start the frontend server: `npm run dev` (in root directory)
4. Backend available at localhost:5000
5. Frontend available at localhost:3000

### Environment Configuration
- Development settings use local database connections
- Environment variables manage all sensitive data
- Separate configurations for development and production

## Database Schema

### Core Tables
- **Books**: BookID, Title, ISBN, Authors, CopiesOwned, CopiesAvailable
- **Members**: MemberID, FirstName, LastName, Email, Password, IsActive
- **Admins**: AdminID, FirstName, LastName, Email, Password, IsActive
- **Loans**: LoanID, BookID, MemberID, DateOut, DateDue, DateReturned
- **Categories**: CategoryID, CategoryName
- **Authors**: AuthorID, AuthorName

## Troubleshooting

### Common Issues
- **Database Connection**: Verify MySQL is running and credentials are correct in .env
- **Port Conflicts**: Ensure ports 3000 and 5000 are available
- **Environment Variables**: Check that all required variables are set in backend/.env
- **Dependencies**: Run `npm install` in both root and backend directories

### Build Errors
- Ensure Node.js version 16 or higher
- Delete `node_modules` and run `npm install` again
- Check for TypeScript errors in the terminal

## Contributing

This project welcomes contributions and improvements. The codebase is structured to be maintainable and extensible, with clear separation of concerns between frontend and backend components.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes following the existing code structure
4. Test thoroughly on both frontend and backend
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Future Enhancements

- Email notifications for due dates and overdue books
- File upload for book covers
- Advanced reporting and analytics
- Mobile application
- Integration with external library systems
- Barcode scanning functionality

**Built with modern web technologies for efficient and secure library management operations**
