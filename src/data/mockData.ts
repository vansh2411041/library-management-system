import { Book, User } from '../types';

export const mockBooks: Book[] = [
  {
    id: '1',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '978-0-06-112008-4',
    category: 'Fiction',
    publishedYear: 1960,
    totalCopies: 5,
    availableCopies: 3,
    description: 'A gripping tale of racial injustice and childhood innocence in the American South.'
  },
  {
    id: '2',
    title: '1984',
    author: 'George Orwell',
    isbn: '978-0-452-28423-4',
    category: 'Dystopian Fiction',
    publishedYear: 1949,
    totalCopies: 4,
    availableCopies: 2,
    description: 'A dystopian social science fiction novel about totalitarian control.'
  },
  {
    id: '3',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0-7432-7356-5',
    category: 'Classic Literature',
    publishedYear: 1925,
    totalCopies: 6,
    availableCopies: 4,
    description: 'A classic American novel set in the Jazz Age.'
  },
  {
    id: '4',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    isbn: '978-0-14-143951-8',
    category: 'Romance',
    publishedYear: 1813,
    totalCopies: 3,
    availableCopies: 1,
    description: 'A romantic novel about manners, upbringing, and marriage in Georgian England.'
  },
  {
    id: '5',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    isbn: '978-0-316-76948-0',
    category: 'Coming-of-Age',
    publishedYear: 1951,
    totalCopies: 4,
    availableCopies: 4,
    description: 'A controversial novel about teenage rebellion and angst.'
  },
  {
    id: '6',
    title: 'Harry Potter and the Sorcerer\'s Stone',
    author: 'J.K. Rowling',
    isbn: '978-0-439-70818-8',
    category: 'Fantasy',
    publishedYear: 1997,
    totalCopies: 8,
    availableCopies: 6,
    description: 'The first book in the beloved Harry Potter series.'
  }
];

export const mockUsers: User[] = [
  {
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    type: 'user',
    borrowedBooks: [
      {
        bookId: '1',
        bookTitle: 'To Kill a Mockingbird',
        borrowDate: '2024-01-15',
        dueDate: '2024-02-15',
        returned: false
      }
    ]
  },
  {
    id: 'admin1',
    name: 'Library Admin',
    email: 'admin@library.com',
    type: 'management',
    borrowedBooks: []
  }
];