import React, { useState } from 'react';
import { User, BookOpen, Lock, Mail, UserPlus, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

interface LoginFormProps {
  onShowAdminRegistration?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onShowAdminRegistration }) => {
  const [userType, setUserType] = useState<'user' | 'management'>('user');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (authMode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match!');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters long!');
          setLoading(false);
          return;
        }
        
        // Split name into first and last name
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        const response = await apiService.register({
          email,
          password,
          firstName,
          lastName
        });
        
        // Store token and user data
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        console.log('Registration successful:', response);
        
        // Dispatch custom event to notify App.tsx
        const authEvent = new CustomEvent('authSuccess', {
          detail: {
            email: email,
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            role: response.user.role || 'user'
          }
        });
        window.dispatchEvent(authEvent);
        
        navigate('/dashboard');
        
      } else {
        // Login
        const response = await apiService.login(email, password);
        
        // Store token and user data
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        console.log('Login successful:', response);
        
        // Dispatch custom event to notify App.tsx
        const authEvent = new CustomEvent('authSuccess', {
          detail: {
            email: email,
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            role: response.user.role || 'user'
          }
        });
        window.dispatchEvent(authEvent);
        
        // Redirect based on user type (you can implement role-based routing later)
        if (userType === 'management' || response.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      console.error('Authentication failed:', error);
      setError(error.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Library Management System</h1>
          <p className="text-gray-600 mt-2">
            {authMode === 'login' ? 'Sign in to access your account' : 'Create your library account'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Auth Mode Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setName('');
              setConfirmPassword('');
              setError('');
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              authMode === 'login'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setUserType('user');
              setEmail('');
              setPassword('');
              setName('');
              setConfirmPassword('');
              setError('');
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              authMode === 'signup'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <UserPlus className="w-4 h-4 inline mr-2" />
            Sign Up
          </button>
        </div>

        {/* User Type Toggle (only for login) */}
        {authMode === 'login' && (
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setUserType('user')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                userType === 'user'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              User Login
            </button>
            <button
              type="button"
              onClick={() => setUserType('management')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                userType === 'management'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Lock className="w-4 h-4 inline mr-2" />
              Management
            </button>
          </div>
        )}

        {authMode === 'signup' && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <UserPlus className="w-4 h-4 inline mr-2" />
              Creating a new user account
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {authMode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your full name"
                  required
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder={
                  authMode === 'signup' 
                    ? 'your.email@example.com'
                    : userType === 'user' 
                      ? 'john@example.com' 
                      : 'admin@library.com'
                }
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>
          </div>

          {authMode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Confirm your password"
                  required
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-medium transition-all duration-200 shadow-lg ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-[1.02] hover:shadow-xl'
            }`}
          >
            {loading 
              ? (authMode === 'login' ? 'Signing In...' : 'Creating Account...')
              : (authMode === 'login' ? 'Sign In' : 'Create Account')
            }
          </button>
        </form>

        {/* Admin Registration Option */}
        {onShowAdminRegistration && authMode === 'login' && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">
                Need administrative access?
              </p>
              <button
                type="button"
                onClick={onShowAdminRegistration}
                className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-700 font-medium hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors duration-200"
                disabled={loading}
              >
                <Shield className="w-4 h-4" />
                Register as Administrator
              </button>
            </div>
          </div>
        )}

        {authMode === 'login' && (
          <div className="mt-6 text-center">
            <div className="text-sm text-gray-600">
              <p className="mb-2">Demo Credentials:</p>
              <div className="bg-gray-50 rounded-lg p-3 text-left">
                <p><strong>User:</strong> john@example.com / password</p>
                <p><strong>Management:</strong> admin@library.com / admin</p>
              </div>
            </div>
          </div>
        )}

        {authMode === 'signup' && (
          <div className="text-sm text-gray-600">
            <div className="mt-6 text-center">
              <p className="text-gray-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setName('');
                    setConfirmPassword('');
                    setError('');
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  disabled={loading}
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
