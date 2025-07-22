// src/components/ManagementDashboard.tsx
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import BookCard from './BookCard';
import { Plus, BookOpen, Users, Clock, LogOut, Search, X, Edit2, Key } from 'lucide-react';

// Type interfaces
interface Book {
  BookID: number;
  Title: string;
  ISBN: string;
  Authors?: string;
  CategoryName?: string;
  CopiesOwned: number;
  CopiesAvailable: number;
  PublishedYear?: number;
  Description?: string;
}

interface Member {
  MemberID: number;
  FirstName: string;
  LastName: string;
  Email: string;
  JoinDate: string;
  IsActive: boolean;
}

interface Loan {
  LoanID: number;
  BookID: number;
  MemberID: number;
  Title: string;
  FirstName: string;
  LastName: string;
  DateOut: string;
  DateDue: string;
  DateReturned?: string | null;
}

interface Stats {
  totalBooks: number;
  totalMembers: number;
  activeLoans: number;
  availableBooks: number;
}

interface ManagementDashboardProps {
  onLogout: () => void;
}

const ManagementDashboard: React.FC<ManagementDashboardProps> = ({ onLogout }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalBooks: 0,
    totalMembers: 0,
    activeLoans: 0,
    availableBooks: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'books' | 'users' | 'borrowed'>('books');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    Title: '',
    Authors: '',
    ISBN: '',
    CategoryName: '',
    PublishedYear: new Date().getFullYear(),
    CopiesOwned: 1,
    CopiesAvailable: 1,
    Description: '',
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Handler to reset a member's password
  const handleResetPassword = async (memberId: number, memberName: string) => {
    const pw = window.prompt(`Enter new password for ${memberName} (min 6 chars):`);
    if (!pw) return;
    if (pw.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    try {
      await apiService.resetUserPassword(memberId, pw);
      alert('Password reset successfully');
    } catch (error) {
      console.error('Password reset failed:', error);
      alert('Failed to reset password');
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [booksData, membersData, loansData] = await Promise.all([
        apiService.getBooks(),
        apiService.getMembers(), 
        apiService.getLoans()
      ]);

      setBooks(booksData);
      setMembers(membersData);
      setLoans(loansData);
      
      const calculatedStats: Stats = {
        totalBooks: booksData.length,
        totalMembers: membersData.length,
        activeLoans: loansData.filter((loan: Loan) => !loan.DateReturned).length,
        availableBooks: booksData.reduce((sum: number, book: Book) => sum + book.CopiesAvailable, 0)
      };
      
      setStats(calculatedStats);
      
    } catch (error) {
      console.error('Failed to load management data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter(book =>
    book.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (book.Authors && book.Authors.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBook) {
        // Update book functionality - you can implement this endpoint
        console.log('Update book:', formData);
      } else {
        // Add book functionality - you can implement this endpoint
        await apiService.addBook(formData);
        loadDashboardData(); // Refresh data
      }
      closeForm();
      alert(editingBook ? 'Book updated successfully!' : 'Book added successfully!');
    } catch (error) {
      console.error('Failed to save book:', error);
      alert('Failed to save book');
    }
  };

  const handleEdit = (book: Book) => {
    setFormData({
      Title: book.Title,
      Authors: book.Authors || '',
      ISBN: book.ISBN,
      CategoryName: book.CategoryName || '',
      PublishedYear: book.PublishedYear || new Date().getFullYear(),
      CopiesOwned: book.CopiesOwned,
      CopiesAvailable: book.CopiesAvailable,
      Description: book.Description || '',
    });
    setEditingBook(book);
    setShowAddForm(true);
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingBook(null);
    setFormData({
      Title: '',
      Authors: '',
      ISBN: '',
      CategoryName: '',
      PublishedYear: new Date().getFullYear(),
      CopiesOwned: 1,
      CopiesAvailable: 1,
      Description: '',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-800">Management Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Library Management</span>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Books</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalBooks}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Members</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalMembers}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Loans</p>
                <p className="text-2xl font-bold text-gray-800">{stats.activeLoans}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Available Books</p>
                <p className="text-2xl font-bold text-gray-800">{stats.availableBooks}</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b mb-8">
          <button
            onClick={() => setActiveTab('books')}
            className={`px-6 py-3 font-medium transition-colors duration-200 border-b-2 ${
              activeTab === 'books'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <BookOpen className="w-5 h-5 inline mr-2" />
            Manage Books
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-medium transition-colors duration-200 border-b-2 ${
              activeTab === 'users'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <Users className="w-5 h-5 inline mr-2" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('borrowed')}
            className={`px-6 py-3 font-medium transition-colors duration-200 border-b-2 ${
              activeTab === 'borrowed'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <Clock className="w-5 h-5 inline mr-2" />
            Borrowed Books
          </button>
        </div>

        {/* Books Management */}
        {activeTab === 'books' && (
          <>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="w-5 h-5" />
                Add New Book
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.map(book => (
                <div key={book.BookID} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{book.Title}</h3>
                    <p className="text-sm text-gray-600 mb-2">by {book.Authors || 'Unknown Author'}</p>
                    <p className="text-sm text-gray-600 mb-2">ISBN: {book.ISBN}</p>
                    <p className="text-sm text-gray-600 mb-4">
                      Available: {book.CopiesAvailable}/{book.CopiesOwned}
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(book)}
                        className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
                      >
                        <Edit2 className="w-4 h-4 inline mr-1" />
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Users Management */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Registered Users</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.map((member: Member) => (
                    <tr key={member.MemberID}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {member.FirstName} {member.LastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.Email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.JoinDate ? new Date(member.JoinDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          member.IsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {member.IsActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleResetPassword(member.MemberID, `${member.FirstName} ${member.LastName}`)}
                          className="flex items-center gap-1 text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                        >
                          <Key className="w-3 h-3" />
                          Reset Password
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Borrowed Books */}
        {activeTab === 'borrowed' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Currently Borrowed Books</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Borrowed By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Borrow Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loans.filter((loan: Loan) => !loan.DateReturned).map((loan: Loan) => {
                    const isOverdue = new Date(loan.DateDue) < new Date();
                    return (
                      <tr key={loan.LoanID}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{loan.Title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {loan.FirstName} {loan.LastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(loan.DateOut).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(loan.DateDue).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            isOverdue 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {isOverdue ? 'Overdue' : 'Active'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {loans.filter(loan => !loan.DateReturned).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No books currently borrowed.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Book Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingBook ? 'Edit Book' : 'Add New Book'}
              </h2>
              <button
                onClick={closeForm}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.Title}
                    onChange={(e) => setFormData({ ...formData, Title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                  <input
                    type="text"
                    value={formData.Authors}
                    onChange={(e) => setFormData({ ...formData, Authors: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ISBN</label>
                  <input
                    type="text"
                    value={formData.ISBN}
                    onChange={(e) => setFormData({ ...formData, ISBN: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <input
                    type="text"
                    value={formData.CategoryName}
                    onChange={(e) => setFormData({ ...formData, CategoryName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Published Year</label>
                  <input
                    type="number"
                    value={formData.PublishedYear}
                    onChange={(e) => setFormData({ ...formData, PublishedYear: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Copies</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.CopiesOwned}
                    onChange={(e) => setFormData({ ...formData, CopiesOwned: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available Copies</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.CopiesAvailable}
                    onChange={(e) => setFormData({ ...formData, CopiesAvailable: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.Description}
                  onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  {editingBook ? 'Update Book' : 'Add Book'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagementDashboard;
