export interface Book {
  id: number;
  title: string;
  author: string;
  description?: string;
  isbn: string;
  publicationDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Loan {
  id: number;
  user_id: number;
  book_id: number;
  loan_date: string;
  return_date: string;
  createdAt?: string;
  updatedAt?: string;
  book?: Book;
}