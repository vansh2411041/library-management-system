export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publishedYear: number;
  totalCopies: number;
  availableCopies: number;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  type: 'user' | 'management';
  borrowedBooks: BorrowedBook[];
}

export interface BorrowedBook {
  bookId: string;
  bookTitle: string;
  borrowDate: string;
  dueDate: string;
  returned: boolean;
}