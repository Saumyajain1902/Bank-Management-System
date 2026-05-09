/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  Book as BookIcon, 
  Users, 
  History, 
  Plus, 
  Search, 
  Library,
  LogOut,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Filter,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Member, BorrowingRecord } from './types';
import { storage } from './storage';

type View = 'dashboard' | 'books' | 'members' | 'history';

// Seed data
const INITIAL_BOOKS: Book[] = [
  { id: 'b1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Fiction', isbn: '978-0743273565', isAvailable: true },
  { id: 'b2', title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Fiction', isbn: '978-0061120084', isAvailable: true },
  { id: 'b3', title: 'A Brief History of Time', author: 'Stephen Hawking', category: 'Science', isbn: '978-0553380163', isAvailable: true },
  { id: 'b4', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', category: 'Psychology', isbn: '978-0374533557', isAvailable: false, borrowedBy: 'm1', dueDate: '2026-05-20' },
];

const INITIAL_MEMBERS: Member[] = [
  { id: 'm1', name: 'Alice Johnson', email: 'alice@example.com', phone: '555-0101', joinDate: '2026-01-15', borrowedBooks: ['b4'] },
  { id: 'm2', name: 'Bob Smith', email: 'bob@example.com', phone: '555-0102', joinDate: '2026-02-10', borrowedBooks: [] },
];

const INITIAL_RECORDS: BorrowingRecord[] = [
  { id: 'r1', bookId: 'b4', memberId: 'm1', issueDate: '2026-05-01', dueDate: '2026-05-20', status: 'active' },
];

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [records, setRecords] = useState<BorrowingRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isIssueBookOpen, setIsIssueBookOpen] = useState(false);
  const [selectedBookForIssue, setSelectedBookForIssue] = useState<Book | null>(null);

  useEffect(() => {
    const storedBooks = storage.getBooks();
    const storedMembers = storage.getMembers();
    const storedRecords = storage.getRecords();

    if (storedBooks.length === 0) {
      setBooks(INITIAL_BOOKS);
      setMembers(INITIAL_MEMBERS);
      setRecords(INITIAL_RECORDS);
      storage.saveBooks(INITIAL_BOOKS);
      storage.saveMembers(INITIAL_MEMBERS);
      storage.saveRecords(INITIAL_RECORDS);
    } else {
      setBooks(storedBooks);
      setMembers(storedMembers);
      setRecords(storedRecords);
    }
  }, []);

  const stats = useMemo(() => {
    return {
      totalBooks: books.length,
      availableBooks: books.filter(b => b.isAvailable).length,
      totalMembers: members.length,
      activeIssues: records.filter(r => r.status === 'active').length,
    };
  }, [books, members, records]);

  const filteredBooks = useMemo(() => {
    return books.filter(b => 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.isbn.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [books, searchQuery]);

  const handleIssueBook = (bookId: string, memberId: string) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 2 weeks duration

    const newRecord: BorrowingRecord = {
      id: `r-${Date.now()}`,
      bookId,
      memberId,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'active',
    };

    const updatedBooks = books.map(b => 
      b.id === bookId ? { ...b, isAvailable: false, borrowedBy: memberId, dueDate: newRecord.dueDate } : b
    );

    const updatedMembers = members.map(m =>
      m.id === memberId ? { ...m, borrowedBooks: [...m.borrowedBooks, bookId] } : m
    );

    const updatedRecords = [...records, newRecord];

    setBooks(updatedBooks);
    setMembers(updatedMembers);
    setRecords(updatedRecords);
    
    storage.saveBooks(updatedBooks);
    storage.saveMembers(updatedMembers);
    storage.saveRecords(updatedRecords);
    
    setIsIssueBookOpen(false);
    setSelectedBookForIssue(null);
  };

  const handleReturnBook = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book || !book.borrowedBy) return;

    const memberId = book.borrowedBy;

    const updatedBooks = books.map(b => 
      b.id === bookId ? { ...b, isAvailable: true, borrowedBy: undefined, dueDate: undefined } : b
    );

    const updatedMembers = members.map(m =>
      m.id === memberId ? { ...m, borrowedBooks: m.borrowedBooks.filter(id => id !== bookId) } : m
    );

    const updatedRecords = records.map(r =>
      (r.bookId === bookId && r.status === 'active') ? { ...r, status: 'returned' as const, returnDate: new Date().toISOString().split('T')[0] } : r
    );

    setBooks(updatedBooks);
    setMembers(updatedMembers);
    setRecords(updatedRecords);
    
    storage.saveBooks(updatedBooks);
    storage.saveMembers(updatedMembers);
    storage.saveRecords(updatedRecords);
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E5E7EB] flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1A1A1A] rounded-xl flex items-center justify-center text-white">
            <Library size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Athenaeum</h1>
            <p className="text-xs text-[#6B7280] font-medium tracking-wide uppercase">Library Mgmt</p>
          </div>
        </div>

        <nav className="flex-1 mt-4 px-4 space-y-1">
          <NavItem 
            icon={<BookIcon size={20} />} 
            label="Dashboard" 
            active={view === 'dashboard'} 
            onClick={() => setView('dashboard')} 
          />
          <NavItem 
            icon={<Library size={20} />} 
            label="Bookshelf" 
            active={view === 'books'} 
            onClick={() => setView('books')} 
          />
          <NavItem 
            icon={<Users size={20} />} 
            label="Members" 
            active={view === 'members'} 
            onClick={() => setView('members')} 
          />
          <NavItem 
            icon={<History size={20} />} 
            label="Borrow History" 
            active={view === 'history'} 
            onClick={() => setView('history')} 
          />
        </nav>

        <div className="p-4 border-top border-[#E5E7EB]">
          <button className="flex items-center gap-3 w-full px-4 py-3 text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F3F4F6] rounded-xl transition-all font-medium text-sm">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-10 py-8 relative">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {view === 'dashboard' && "Overview"}
              {view === 'books' && "Library Bookshelf"}
              {view === 'members' && "Member Directory"}
              {view === 'history' && "Borrowing History"}
            </h2>
            <p className="text-[#6B7280] mt-1">
              {view === 'dashboard' && "Monitor library health and active circulations."}
              {view === 'books' && "Manage and search your collection of titles."}
              {view === 'members' && "Keep track of registered readers and their status."}
              {view === 'history' && "Review past and present book circulations."}
            </p>
          </div>
          
          <div className="flex gap-3">
            {view === 'books' && (
              <button 
                onClick={() => setIsAddBookOpen(true)}
                className="bg-[#1A1A1A] text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-[#333] transition-colors"
              >
                <Plus size={18} />
                <span>Add Book</span>
              </button>
            )}
            {view === 'members' && (
              <button 
                onClick={() => setIsAddMemberOpen(true)}
                className="bg-[#1A1A1A] text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-[#333] transition-colors"
              >
                <Plus size={18} />
                <span>Register Member</span>
              </button>
            )}
          </div>
        </header>

        {/* View Content */}
        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-6">
                <StatCard label="Total Books" value={stats.totalBooks} icon={<BookIcon className="text-blue-600" />} />
                <StatCard label="Available" value={stats.availableBooks} icon={<CheckCircle2 className="text-green-600" />} />
                <StatCard label="Active Issues" value={stats.activeIssues} icon={<AlertCircle className="text-orange-600" />} />
                <StatCard label="Total Members" value={stats.totalMembers} icon={<Users className="text-purple-600" />} />
              </div>

              {/* Recent Activity / Quick Actions */}
              <div className="grid grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <History size={20} className="text-[#6B7280]" />
                    Recent Issues
                  </h3>
                  <div className="space-y-4">
                    {records.slice(-5).reverse().map(record => {
                      const book = books.find(b => b.id === record.bookId);
                      const member = members.find(m => m.id === record.memberId);
                      return (
                        <div key={record.id} className="flex items-center justify-between py-2 border-b border-[#F3F4F6] last:border-0">
                          <div>
                            <p className="font-semibold text-sm">{book?.title}</p>
                            <p className="text-xs text-[#6B7280]">Issued to {member?.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-mono text-[#6B7280]">{record.issueDate}</p>
                            <span className={`text-[10px] uppercase tracking-wider font-bold ${record.status === 'active' ? 'text-orange-600' : 'text-green-600'}`}>
                              {record.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Calendar size={20} className="text-[#6B7280]" />
                    Upcoming Deadlines
                  </h3>
                  <div className="space-y-4">
                    {records.filter(r => r.status === 'active').sort((a,b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 5).map(record => {
                      const book = books.find(b => b.id === record.bookId);
                      return (
                        <div key={record.id} className="flex items-center justify-between py-2 border-b border-[#F3F4F6] last:border-0">
                          <div>
                            <p className="font-semibold text-sm">{book?.title}</p>
                            <p className="text-xs text-red-500">Due {record.dueDate}</p>
                          </div>
                          <button 
                            onClick={() => handleReturnBook(record.bookId)}
                            className="bg-[#F3F4F6] text-[#1A1A1A] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#E5E7EB] transition-colors"
                          >
                            Return
                          </button>
                        </div>
                      );
                    })}
                    {records.filter(r => r.status === 'active').length === 0 && (
                      <p className="text-[#6B7280] text-sm italic">No active circulations.</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'books' && (
            <motion.div 
              key="books"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search by title, author, or ISBN..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-[#E5E7EB] rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] focus:border-transparent transition-all shadow-sm"
                  />
                </div>
                <button className="bg-white border border-[#E5E7EB] px-6 rounded-2xl flex items-center gap-2 hover:bg-[#F9FAFB] transition-colors shadow-sm font-semibold">
                  <Filter size={18} />
                  <span>Category</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map(book => (
                  <BookCard 
                    key={book.id} 
                    book={book} 
                    onIssue={(b) => {
                      setSelectedBookForIssue(b);
                      setIsIssueBookOpen(true);
                    }}
                    onReturn={() => handleReturnBook(book.id)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {view === 'members' && (
            <motion.div 
              key="members"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                      <th className="text-left px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Member</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Contact</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Borrowed</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Join Date</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {members.map(member => (
                      <tr key={member.id} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#F3F4F6] rounded-lg flex items-center justify-center text-[#1A1A1A] font-bold text-xs">
                              {member.name.charAt(0)}
                            </div>
                            <span className="font-semibold text-sm">{member.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm">{member.email}</p>
                          <p className="text-xs text-[#6B7280]">{member.phone}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`${member.borrowedBooks.length > 0 ? 'text-orange-600 font-bold' : 'text-[#6B7280]'} text-sm`}>
                            {member.borrowedBooks.length} Books
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-mono text-[#6B7280]">{member.joinDate}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-[#6B7280] hover:text-[#1A1A1A]">
                            <ChevronRight size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {view === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                      <th className="text-left px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Book</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Member</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Issue Date</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Due Date</th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {[...records].reverse().map(record => {
                      const book = books.find(b => b.id === record.bookId);
                      const member = members.find(m => m.id === record.memberId);
                      return (
                        <tr key={record.id} className="hover:bg-[#F9FAFB] transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-sm">{book?.title}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm">{member?.name}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-mono text-[#6B7280]">{record.issueDate}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-mono text-[#6B7280]">{record.dueDate}</span>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={record.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {records.length === 0 && (
                  <div className="p-10 text-center text-[#6B7280]">
                    No records found.
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modals */}
        <Modal 
          isOpen={isAddBookOpen} 
          onClose={() => setIsAddBookOpen(false)} 
          title="Add New Book"
        >
          <BookForm onSubmit={(data) => {
            const newBook: Book = { ...data, id: `b-${Date.now()}`, isAvailable: true };
            const updated = [...books, newBook];
            setBooks(updated);
            storage.saveBooks(updated);
            setIsAddBookOpen(false);
          }} onClose={() => setIsAddBookOpen(false)} />
        </Modal>

        <Modal 
          isOpen={isAddMemberOpen} 
          onClose={() => setIsAddMemberOpen(false)} 
          title="Register New Member"
        >
          <MemberForm onSubmit={(data) => {
            const newMember: Member = { 
              ...data, 
              id: `m-${Date.now()}`, 
              joinDate: new Date().toISOString().split('T')[0],
              borrowedBooks: []
            };
            const updated = [...members, newMember];
            setMembers(updated);
            storage.saveMembers(updated);
            setIsAddMemberOpen(false);
          }} onClose={() => setIsAddMemberOpen(false)} />
        </Modal>

        <Modal 
          isOpen={isIssueBookOpen} 
          onClose={() => {
            setIsIssueBookOpen(false);
            setSelectedBookForIssue(null);
          }} 
          title="Issue Book"
        >
          <div className="space-y-6">
            <div className="bg-[#F9FAFB] p-4 rounded-xl border border-[#E5E7EB]">
              <p className="text-xs text-[#6B7280] font-bold uppercase mb-1">Book to Issue</p>
              <p className="font-bold">{selectedBookForIssue?.title}</p>
              <p className="text-sm text-[#6B7280]">{selectedBookForIssue?.author}</p>
            </div>
            
            <div>
              <p className="text-sm font-bold mb-3">Select Member</p>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {members.map(member => (
                  <button
                    key={member.id}
                    onClick={() => selectedBookForIssue && handleIssueBook(selectedBookForIssue.id, member.id)}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-[#E5E7EB] hover:border-[#1A1A1A] hover:bg-[#F9FAFB] transition-all text-left"
                  >
                    <div>
                      <p className="font-semibold text-sm">{member.name}</p>
                      <p className="text-xs text-[#6B7280]">{member.email}</p>
                    </div>
                    <ChevronRight size={18} className="text-[#9CA3AF]" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all
        ${active 
          ? 'bg-[#1A1A1A] text-white shadow-lg shadow-black/5' 
          : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1A1A1A]'}
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function StatCard({ label, value, icon }: { label: string, value: number, icon: ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-[#F9FAFB] rounded-lg">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-[#6B7280] text-sm font-medium">{label}</p>
        <p className="text-3xl font-bold mt-1 tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function BookCard({ book, onIssue, onReturn }: { book: Book, onIssue: (b: Book) => void, onReturn: () => void, key?: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all flex flex-col h-full">
      <div className="flex-1">
        <div className="flex justify-between items-start mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] bg-[#F3F4F6] px-2 py-1 rounded">
            {book.category}
          </span>
          <AvailabilityBadge available={book.isAvailable} />
        </div>
        <h4 className="font-bold text-lg leading-snug mb-1">{book.title}</h4>
        <p className="text-sm text-[#6B7280] mb-4">by {book.author}</p>
        
        <div className="space-y-1.5 pt-4 border-t border-[#F3F4F6]">
          <div className="flex justify-between text-xs">
            <span className="text-[#9CA3AF]">ISBN:</span>
            <span className="font-mono">{book.isbn}</span>
          </div>
          {!book.isAvailable && book.dueDate && (
            <div className="flex justify-between text-xs">
              <span className="text-[#9CA3AF]">Due:</span>
              <span className="text-red-500 font-bold">{book.dueDate}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        {book.isAvailable ? (
          <button 
            onClick={() => onIssue(book)}
            className="w-full bg-[#1A1A1A] text-white py-2.5 rounded-xl text-sm font-bold hover:bg-[#333] transition-colors"
          >
            Issue Book
          </button>
        ) : (
          <button 
            onClick={onReturn}
            className="w-full bg-[#F3F4F6] text-[#1A1A1A] py-2.5 rounded-xl text-sm font-bold hover:bg-[#E5E7EB] transition-colors"
          >
            Return Book
          </button>
        )}
      </div>
    </div>
  );
}

function AvailabilityBadge({ available }: { available: boolean }) {
  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight ${available ? 'text-green-600 bg-green-50' : 'text-orange-600 bg-orange-50'}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${available ? 'bg-green-600' : 'bg-orange-600'}`} />
      {available ? 'Available' : 'Issued'}
    </div>
  );
}

function StatusBadge({ status }: { status: BorrowingRecord['status'] }) {
  const styles = {
    active: 'bg-orange-50 text-orange-600 border-orange-200',
    returned: 'bg-green-50 text-green-600 border-green-200',
    overdue: 'bg-red-50 text-red-600 border-red-200',
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${styles[status]}`}>
      {status.toUpperCase()}
    </span>
  );
}

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-[#F3F4F6] flex justify-between items-center">
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-[#F3F4F6] rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-8">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

function BookForm({ onSubmit, onClose }: { onSubmit: (data: Omit<Book, 'id' | 'isAvailable'>) => void, onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: 'Fiction',
    isbn: '',
  });

  const categories = ['Fiction', 'Non-Fiction', 'Science', 'History', 'Technology', 'Psychology', 'Business'];

  return (
    <form className="space-y-4" onSubmit={(e) => {
      e.preventDefault();
      onSubmit(formData);
    }}>
      <div className="space-y-1">
        <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider ml-1">Title</label>
        <input 
          required
          type="text" 
          value={formData.title}
          onChange={e => setFormData({...formData, title: e.target.value})}
          className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider ml-1">Author</label>
        <input 
          required
          type="text" 
          value={formData.author}
          onChange={e => setFormData({...formData, author: e.target.value})}
          className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]"
        />
      </div>
      <div className="flex gap-4">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider ml-1">Category</label>
          <select 
            value={formData.category}
            onChange={e => setFormData({...formData, category: e.target.value})}
            className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider ml-1">ISBN</label>
          <input 
            required
            type="text" 
            value={formData.isbn}
            onChange={e => setFormData({...formData, isbn: e.target.value})}
            className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]"
          />
        </div>
      </div>
      <div className="flex gap-3 pt-6">
        <button type="button" onClick={onClose} className="flex-1 bg-[#F3F4F6] text-[#1A1A1A] py-3 rounded-xl font-bold hover:bg-[#E5E7EB] transition-colors">Cancel</button>
        <button type="submit" className="flex-1 bg-[#1A1A1A] text-white py-3 rounded-xl font-bold hover:bg-[#333] transition-colors">Add Book</button>
      </div>
    </form>
  );
}

function MemberForm({ onSubmit, onClose }: { onSubmit: (data: Omit<Member, 'id' | 'joinDate' | 'borrowedBooks'>) => void, onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  return (
    <form className="space-y-4" onSubmit={(e) => {
      e.preventDefault();
      onSubmit(formData);
    }}>
      <div className="space-y-1">
        <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider ml-1">Full Name</label>
        <input 
          required
          type="text" 
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
          className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider ml-1">Email Address</label>
        <input 
          required
          type="email" 
          value={formData.email}
          onChange={e => setFormData({...formData, email: e.target.value})}
          className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider ml-1">Phone Number</label>
        <input 
          required
          type="tel" 
          value={formData.phone}
          onChange={e => setFormData({...formData, phone: e.target.value})}
          className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]"
        />
      </div>
      <div className="flex gap-3 pt-6">
        <button type="button" onClick={onClose} className="flex-1 bg-[#F3F4F6] text-[#1A1A1A] py-3 rounded-xl font-bold hover:bg-[#E5E7EB] transition-colors">Cancel</button>
        <button type="submit" className="flex-1 bg-[#1A1A1A] text-white py-3 rounded-xl font-bold hover:bg-[#333] transition-colors">Register</button>
      </div>
    </form>
  );
}
