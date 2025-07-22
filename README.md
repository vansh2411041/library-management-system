# Interactive Library Management System

A modern, full-featured library management system built with React, TypeScript, and Tailwind CSS. This application provides separate interfaces for library users and management staff with comprehensive book management and borrowing capabilities.

## 🚀 Features

### User Features
- **User Registration & Authentication**: Secure signup and login system
- **Book Catalog**: Browse and search through the library's book collection
- **Advanced Search**: Filter books by title, author, and category
- **Book Borrowing**: Borrow available books with automatic due date calculation
- **Personal Library**: View currently borrowed books with due dates
- **Return System**: Easy book return functionality
- **Overdue Tracking**: Visual indicators for overdue books

### Management Features
- **Admin Dashboard**: Comprehensive overview with statistics
- **Book Management**: Full CRUD operations (Create, Read, Update, Delete)
- **User Management**: View all registered users and their borrowing history
- **Borrowing Oversight**: Monitor all borrowed books and overdue items
- **Inventory Control**: Track book availability and copies

### Technical Features
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI/UX**: Clean, intuitive interface with smooth animations
- **Type Safety**: Full TypeScript implementation
- **Component Architecture**: Modular, reusable React components
- **State Management**: Efficient local state management with React hooks

## 🛠️ Technology Stack

### Frontend Framework
- **React 18.3.1**: Modern React with hooks and functional components
- **TypeScript 5.5.3**: Type-safe JavaScript development
- **Vite 5.4.2**: Fast build tool and development server

### Styling & UI
- **Tailwind CSS 3.4.1**: Utility-first CSS framework
- **Lucide React 0.344.0**: Beautiful, customizable icons
- **PostCSS 8.4.35**: CSS processing with autoprefixer

### Development Tools
- **ESLint 9.9.1**: Code linting and quality assurance
- **TypeScript ESLint**: TypeScript-specific linting rules
- **React Hooks ESLint**: React hooks linting
- **React Refresh**: Hot module replacement for development

## 📁 Project Structure

```
src/
├── components/           # Reusable React components
│   ├── BookCard.tsx     # Individual book display component
│   ├── LoginForm.tsx    # Authentication form with signup/login
│   ├── UserDashboard.tsx        # User interface dashboard
│   └── ManagementDashboard.tsx  # Admin interface dashboard
├── data/
│   └── mockData.ts      # Sample data for books and users
├── types.ts             # TypeScript type definitions
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
├── index.css            # Global styles and Tailwind imports
└── vite-env.d.ts        # Vite environment types
```

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone or download the project**
   ```bash
   # If using git
   git clone <repository-url>
   cd library-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to view the application

### Available Scripts

- **`npm run dev`**: Start development server with hot reload
- **`npm run build`**: Build the application for production
- **`npm run preview`**: Preview the production build locally
- **`npm run lint`**: Run ESLint to check code quality

## 🔐 Authentication & Demo Accounts

### Demo Credentials

**User Account:**
- Email: `john@example.com`
- Password: `password`

**Management Account:**
- Email: `admin@library.com`
- Password: `admin`

### Creating New Accounts
Users can create new accounts using the signup tab on the login page. Management accounts are pre-configured for security.

## 📚 Usage Guide

### For Library Users

1. **Sign Up/Login**
   - Use the signup tab to create a new account
   - Or login with existing credentials

2. **Browse Books**
   - View all available books in the catalog
   - Use search to find specific titles or authors
   - Filter by category for easier browsing

3. **Borrow Books**
   - Click "Borrow" on any available book
   - Books are automatically added to your borrowed list
   - Due date is set to 1 month from borrow date

4. **Manage Borrowed Books**
   - Switch to "My Books" tab to view borrowed items
   - See due dates and overdue status
   - Return books when finished

### For Management Staff

1. **Login**
   - Use management credentials to access admin dashboard

2. **View Statistics**
   - Dashboard shows total books, users, and borrowed items
   - Quick overview of library status

3. **Manage Books**
   - Add new books with complete details
   - Edit existing book information
   - Delete books from the catalog
   - Search and filter book inventory

4. **Monitor Users**
   - View all registered users
   - Track borrowing activity
   - Monitor overdue books

## 🎨 Design System

### Color Palette
- **Primary Blue**: #2563eb (buttons, links, accents)
- **Secondary Teal**: #0d9488 (success states, highlights)
- **Success Green**: #059669 (available status, confirmations)
- **Warning Orange**: #d97706 (due soon, warnings)
- **Error Red**: #dc2626 (overdue, errors, deletions)
- **Neutral Grays**: #f9fafb to #111827 (backgrounds, text, borders)

### Typography
- **Font Family**: System font stack for optimal performance
- **Headings**: Bold weights (600-700) for hierarchy
- **Body Text**: Regular weight (400) for readability
- **UI Elements**: Medium weight (500) for buttons and labels

### Spacing System
- **Base Unit**: 8px grid system
- **Component Padding**: 16px, 24px for cards and containers
- **Section Margins**: 32px, 48px for layout spacing

## 🔧 Configuration Files

### Core Configuration
- **`package.json`**: Dependencies and scripts
- **`tsconfig.json`**: TypeScript configuration
- **`vite.config.ts`**: Vite build configuration
- **`tailwind.config.js`**: Tailwind CSS customization
- **`eslint.config.js`**: Code linting rules

### Environment Setup
- **`postcss.config.js`**: PostCSS plugins configuration
- **`index.html`**: Main HTML template
- **`src/vite-env.d.ts`**: Vite environment types

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px and above

Key responsive features:
- Adaptive grid layouts (1-4 columns based on screen size)
- Mobile-optimized navigation
- Touch-friendly button sizes
- Readable typography scaling

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

### Deployment Options
The built application can be deployed to:
- **Netlify**: Drag and drop the `dist` folder
- **Vercel**: Connect your repository for automatic deployments
- **GitHub Pages**: Use the built files for static hosting
- **Any static hosting service**: Upload the `dist` folder contents

## 🔄 Data Management

### Current Implementation
- Uses mock data stored in `src/data/mockData.ts`
- State managed with React hooks
- Data persists during session but resets on page refresh

### Future Enhancements
- Database integration (PostgreSQL, MongoDB)
- User authentication with JWT tokens
- Real-time updates with WebSocket connections
- File upload for book covers
- Email notifications for due dates

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Book browsing and searching
- [ ] Book borrowing and returning
- [ ] Management book CRUD operations
- [ ] Responsive design on different devices
- [ ] Form validation and error handling

### Automated Testing (Future)
- Unit tests with Jest and React Testing Library
- Integration tests for user workflows
- E2E tests with Playwright or Cypress

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Standards
- Follow TypeScript best practices
- Use functional components with hooks
- Maintain consistent formatting with ESLint
- Write descriptive component and function names
- Add comments for complex logic

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

### Common Issues

**Build Errors:**
- Ensure Node.js version 16 or higher
- Delete `node_modules` and run `npm install` again
- Check for TypeScript errors in the terminal

**Styling Issues:**
- Verify Tailwind CSS is properly configured
- Check browser developer tools for CSS conflicts
- Ensure all Tailwind classes are spelled correctly

**Authentication Problems:**
- Use the provided demo credentials
- Check browser console for JavaScript errors
- Verify form validation requirements

### Getting Help
- Check the browser console for error messages
- Review the component code for implementation details
- Refer to the React and TypeScript documentation

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**