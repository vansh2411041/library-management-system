import React, { useState } from 'react';
import { Book as BookType, BorrowedBook } from '../types';
import BookCard from './BookCard';
import { Search, BookOpen, Clock, LogOut, RefreshCw } from 'lucide-react';

interface UserDashboardProps {
  books: BookType[];
  borrowedBooks: BorrowedBook[];
  userName: string;
  onBorrow: (bookId: string) => void;
  onReturn: (bookId: string) => void;
  onLogout: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({
  books,
  borrowedBooks,
  userName,
  onBorrow,
  onReturn,
  onLogout,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeTab, setActiveTab] = useState<'browse' | 'borrowed'>('browse');

  const categories = [...new Set(books.map(book => book.category))];
  
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const borrowedBookDetails = books.filter(book => 
    borrowedBooks.some(borrowed => borrowed.bookId === book.id && !borrowed.returned)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-800">Library Portal</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Welcome, {userName}</span>
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
        {/* Navigation Tabs */}
        <div className="flex border-b mb-8">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-6 py-3 font-medium transition-colors duration-200 border-b-2 ${
              activeTab === 'browse'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <BookOpen className="w-5 h-5 inline mr-2" />
            Browse Books ({filteredBooks.length})
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
            My Books ({borrowedBookDetails.length})
          </button>
        </div>

        {activeTab === 'browse' && (
          <>
            {/* Search and Filter */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search books by title or author..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Books Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.map(book => (
                <BookCard
                  key={book.id}
                  book={book}
                  onBorrow={onBorrow}
                  showActions={true}
                  userType="user"
                />
              ))}
            </div>

            {filteredBooks.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No books found matching your criteria.</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'borrowed' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Currently Borrowed Books</h2>
            </div>

            {borrowedBookDetails.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {borrowedBookDetails.map(book => {
                    const borrowInfo = borrowedBooks.find(b => b.bookId === book.id && !b.returned);
                    return (
                      <div key={book.id} className="relative">
                        <BookCard
                          book={book}
                          onReturn={onReturn}
                          showActions={true}
                          userType="user"
                          borrowed={true}
                        />
                        {borrowInfo && (
                          <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm">
                            <p><strong>Borrowed:</strong> {new Date(borrowInfo.borrowDate).toLocaleDateString()}</p>
                            <p><strong>Due:</strong> {new Date(borrowInfo.dueDate).toLocaleDateString()}</p>
                            {new Date(borrowInfo.dueDate) < new Date() && (
                              <p className="text-red-600 font-medium mt-1">⚠ Overdue</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">No books currently borrowed.</p>
                <p className="text-gray-400">Browse the catalog to borrow some books!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;