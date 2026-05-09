/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Book, Member, BorrowingRecord } from './types';

const STORAGE_KEYS = {
  BOOKS: 'athenaeum_books',
  MEMBERS: 'athenaeum_members',
  RECORDS: 'athenaeum_records',
};

export const storage = {
  getBooks: (): Book[] => {
    const data = localStorage.getItem(STORAGE_KEYS.BOOKS);
    return data ? JSON.parse(data) : [];
  },
  saveBooks: (books: Book[]) => {
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
  },
  getMembers: (): Member[] => {
    const data = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    return data ? JSON.parse(data) : [];
  },
  saveMembers: (members: Member[]) => {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  },
  getRecords: (): BorrowingRecord[] => {
    const data = localStorage.getItem(STORAGE_KEYS.RECORDS);
    return data ? JSON.parse(data) : [];
  },
  saveRecords: (records: BorrowingRecord[]) => {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  },
};
