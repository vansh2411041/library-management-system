import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Book as BookType, User, BorrowedBook } from './types';
import { mockBooks, mockUsers } from './data/mockData';
import LoginForm from './components/LoginForm';
import AdminRegistration from './components/AdminRegistration';
import UserDashboard from './components/UserDashboard';
import ManagementDashboard from './components/ManagementDashboard';
import { apiService } from './services/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAdminRegistration, setShowAdminRegistration] = useState(false);
  const [books, setBooks] = useState<BookType[]>(mockBooks);
  const [users, setUsers] = useState<User[]>(mockUsers);

  const handleLogin = (userType: 'user' | 'management', credentials: { email: string; password: string }) => {
    // Simple authentication logic
    if (userType === 'user' && credentials.email === 'john@example.com' && credentials.password === 'password') {
      const user = users.find(u => u.email === credentials.email);
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
      }
    } else if (userType === 'management' && credentials.email === 'admin@library.com' && credentials.password === 'admin') {
      const admin = users.find(u => u.type === 'management');
      if (admin) {
        setCurrentUser(admin);
        setIsAuthenticated(true);
      }
    } else {
      // Check if it's a registered user
      const user = users.find(u => u.email === credentials.email && u.type === 'user');
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
      } else {
        alert('Invalid credentials. Please check your email and password or use the demo credentials.');
      }
    }
  };

  const handleSignup = (userData: { name: string; email: string; password: string }) => {
    // Check if user already exists
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      alert('An account with this email already exists. Please use a different email or sign in.');
      return;
    }

    // Create new user
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      type: 'user',
      borrowedBooks: [],
    };

    // Add to users list
    setUsers(prevUsers => [...prevUsers, newUser]);
    
    // Auto-login the new user
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    
    alert(`Welcome to the library, ${userData.name}! Your account has been created successfully.`);
  };

  // New admin registration handler
  const handleAdminRegistration = async (adminData: { name: string; email: string; password: string; secretCode: string }) => {
    try {
      const response = await apiService.registerAdmin(adminData);
      
      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Create user object for your app state
      const newAdmin: User = {
        id: `admin_${response.user.id}`,
        name: adminData.name,
        email: adminData.email,
        type: 'management',
        borrowedBooks: [],
      };
      
      // Add to users list for local state consistency
      setUsers(prevUsers => [...prevUsers, newAdmin]);
      
      setCurrentUser(newAdmin);
      setIsAuthenticated(true);
      setShowAdminRegistration(false);
      
      // Dispatch custom event for consistency
      const authEvent = new CustomEvent('authSuccess', {
        detail: {
          email: adminData.email,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          role: 'admin'
        }
      });
      window.dispatchEvent(authEvent);
      
      alert(`Welcome, ${adminData.name}! Your admin account has been created successfully and you are now logged in.`);
    } catch (error: any) {
      console.error('Admin registration failed:', error);
      alert(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    // Clear stored auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const handleBorrow = async (bookId: string) => {
    if (!currentUser) return;

    try {
      console.log('🔄 Attempting to borrow book:', bookId);
      
      // Get current user data from localStorage (for real database user ID)
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        alert('Please log in again');
        return;
      }
      
      const userData = JSON.parse(storedUser);
      console.log('👤 Current user data:', userData);
      
      // Call the API instead of updating mock data
      const response = await apiService.borrowBook(parseInt(bookId), userData.id);
      console.log('✅ Borrow response:', response);
      
      alert(`Successfully borrowed book! ${response.message}`);
      
      // Update local mock data for consistency (optional)
      const book = books.find(b => b.id === bookId);
      if (book && book.availableCopies > 0) {
        setBooks(prevBooks =>
          prevBooks.map(b =>
            b.id === bookId
              ? { ...b, availableCopies: b.availableCopies - 1 }
              : b
          )
        );
      }
      
    } catch (error: any) {
      console.error('❌ Failed to borrow book:', error);
      alert(error.response?.data?.message || 'Failed to borrow book. Please try again.');
    }
  };

  const handleReturn = (bookId: string) => {
    if (!currentUser) return;

    const book = books.find(b => b.id === bookId);
    if (!book) return;

    // Mark book as returned
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === currentUser.id
          ? {
              ...user,
              borrowedBooks: user.borrowedBooks.map(borrowedBook =>
                borrowedBook.bookId === bookId && !borrowedBook.returned
                  ? { ...borrowedBook, returned: true }
                  : borrowedBook
              )
            }
          : user
      )
    );

    // Update current user state
    setCurrentUser(prev => prev ? {
      ...prev,
      borrowedBooks: prev.borrowedBooks.map(borrowedBook =>
        borrowedBook.bookId === bookId && !borrowedBook.returned
          ? { ...borrowedBook, returned: true }
          : borrowedBook
      )
    } : null);

    // Update book availability
    setBooks(prevBooks =>
      prevBooks.map(b =>
        b.id === bookId
          ? { ...b, availableCopies: b.availableCopies + 1 }
          : b
      )
    );

    alert(`Successfully returned "${book.title}".`);
  };

  const handleAddBook = (newBook: Omit<BookType, 'id'>) => {
    const book: BookType = {
      ...newBook,
      id: Date.now().toString(),
    };
    setBooks(prevBooks => [...prevBooks, book]);
    alert('Book added successfully!');
  };

  const handleEditBook = (bookId: string, updatedBook: Partial<BookType>) => {
    setBooks(prevBooks =>
      prevBooks.map(book =>
        book.id === bookId ? { ...book, ...updatedBook } : book
      )
    );
    alert('Book updated successfully!');
  };

  const handleDeleteBook = (bookId: string) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      setBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
      alert('Book deleted successfully!');
    }
  };

  // Listen to authentication events from LoginForm
  React.useEffect(() => {
    const handleAuthSuccess = (event: CustomEvent) => {
      setIsAuthenticated(true);
      const userData = event.detail;
      const user = users.find(u => u.email === userData.email) || {
        id: `user_${Date.now()}`,
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        type: userData.role === 'admin' ? 'management' : 'user',
        borrowedBooks: [],
      };
      setCurrentUser(user);
    };

    window.addEventListener('authSuccess', handleAuthSuccess as EventListener);
    return () => {
      window.removeEventListener('authSuccess', handleAuthSuccess as EventListener);
    };
  }, [users]);

  return (
    <Router>
      {showAdminRegistration ? (
        <AdminRegistration 
          onRegisterAdmin={handleAdminRegistration}
          onBack={() => setShowAdminRegistration(false)}
        />
      ) : !isAuthenticated || !currentUser ? (
        <LoginForm onShowAdminRegistration={() => setShowAdminRegistration(true)} />
      ) : currentUser.type === 'management' ? (
        <ManagementDashboard
          onLogout={handleLogout}
        />
      ) : (
        <UserDashboard
          books={books}
          borrowedBooks={currentUser.borrowedBooks}
          userName={currentUser.name}
          onBorrow={handleBorrow}
          onReturn={handleReturn}
          onLogout={handleLogout}
        />
      )}
    </Router>
  );
}

export default App;
