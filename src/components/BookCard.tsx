import React from 'react';
import { Book as BookType } from '../types';
import { Calendar, User, Hash, Tag } from 'lucide-react';

interface BookCardProps {
  book: BookType;
  onBorrow?: (bookId: string) => void;
  onReturn?: (bookId: string) => void;
  onEdit?: (bookId: string) => void;
  onDelete?: (bookId: string) => void;
  showActions: boolean;
  userType: 'user' | 'management';
  borrowed?: boolean;
}

const BookCard: React.FC<BookCardProps> = ({
  book,
  onBorrow,
  onReturn,
  onEdit,
  onDelete,
  showActions,
  userType,
  borrowed = false,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{book.title}</h3>
          <div className="flex items-center text-gray-600 mb-2">
            <User className="w-4 h-4 mr-2" />
            <span className="text-sm">{book.author}</span>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          book.availableCopies > 0 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {book.availableCopies > 0 ? 'Available' : 'Not Available'}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-600 text-sm">
          <Hash className="w-4 h-4 mr-2" />
          <span>ISBN: {book.isbn}</span>
        </div>
        <div className="flex items-center text-gray-600 text-sm">
          <Tag className="w-4 h-4 mr-2" />
          <span>{book.category}</span>
        </div>
        <div className="flex items-center text-gray-600 text-sm">
          <Calendar className="w-4 h-4 mr-2" />
          <span>Published: {book.publishedYear}</span>
        </div>
      </div>

      <div className="text-sm text-gray-600 mb-4">
        <p className="line-clamp-3">{book.description}</p>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <span>Available: {book.availableCopies}</span>
        <span>Total: {book.totalCopies}</span>
      </div>

      {showActions && (
        <div className="flex gap-2">
          {userType === 'user' && !borrowed && (
            <button
              onClick={() => onBorrow?.(book.id)}
              disabled={book.availableCopies === 0}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                book.availableCopies > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Borrow
            </button>
          )}
          
          {userType === 'user' && borrowed && (
            <button
              onClick={() => onReturn?.(book.id)}
              className="flex-1 py-2 px-4 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 hover:scale-[1.02] transition-all duration-200"
            >
              Return
            </button>
          )}

          {userType === 'management' && (
            <>
              <button
                onClick={() => onEdit?.(book.id)}
                className="flex-1 py-2 px-4 rounded-lg font-medium bg-teal-600 text-white hover:bg-teal-700 hover:scale-[1.02] transition-all duration-200"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete?.(book.id)}
                className="flex-1 py-2 px-4 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 hover:scale-[1.02] transition-all duration-200"
              >
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BookCard;