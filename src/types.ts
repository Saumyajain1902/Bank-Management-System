/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  isAvailable: boolean;
  borrowedBy?: string; // Member ID
  dueDate?: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  borrowedBooks: string[]; // Book IDs
}

export interface BorrowingRecord {
  id: string;
  bookId: string;
  memberId: string;
  issueDate: string;
  returnDate?: string;
  dueDate: string;
  status: 'active' | 'returned' | 'overdue';
}
