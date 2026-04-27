import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  PiggyBank, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  User, 
  LogOut, 
  Wallet,
  CreditCard,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { Account, Transaction, AppView } from "./types";

export default function App() {
  const [view, setView] = useState<AppView>("login");
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [recentAccount, setRecentAccount] = useState<string | null>(null);

  // Form states
  const [loginForm, setLoginForm] = useState({ accountNumber: "", pin: "" });
  const [regForm, setRegForm] = useState({ holderName: "", pin: "" , initialDeposit: "" });
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/accounts/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAccount(data);
      setRecentAccount(null); // Clear once logged in
      setView("dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...regForm,
          initialDeposit: parseFloat(regForm.initialDeposit) || 0
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRecentAccount(data.accountNumber);
      setSuccess("Account Created Successfully!");
      setTimeout(() => setSuccess(null), 5000);
      setView("login");
      setLoginForm({ ...loginForm, accountNumber: data.accountNumber });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTransaction = async (type: "deposit" | "withdrawal") => {
    if (!account || !amount) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/accounts/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountNumber: account.accountNumber,
          type,
          amount: parseFloat(amount),
          description: desc || (type === "deposit" ? "Cash Deposit" : "Cash Withdrawal")
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAccount(data);
      setAmount("");
      setDesc("");
      setSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} Successful!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAccount(null);
    setView("login");
    setLoginForm({ accountNumber: "", pin: "" });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-red-50 border-l-4 border-red-500 p-4 shadow-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </motion.div>
          )}
          {success && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-emerald-50 border-l-4 border-emerald-500 p-4 shadow-lg flex items-start gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <p className="text-emerald-700 text-sm font-medium">{success}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <PiggyBank className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">APEX BANK</span>
          </div>
          {account && (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Account Holder</p>
                <p className="text-sm font-semibold text-slate-800">{account.holderName}</p>
              </div>
              <button 
                onClick={logout}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors group"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          {view === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto mt-12"
            >
              {recentAccount && (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-blue-600 p-6 rounded-3xl mb-6 text-white shadow-xl shadow-blue-200"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <p className="font-bold">Account Ready</p>
                  </div>
                  <p className="text-blue-100 text-sm mb-4">Your login account number is:</p>
                  <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm flex justify-between items-center border border-white/20">
                    <span className="text-2xl font-mono font-bold tracking-widest">{recentAccount}</span>
                    <button 
                      onClick={() => navigator.clipboard.writeText(recentAccount)}
                      className="text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 px-2 py-1 rounded transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="mt-4 text-[10px] font-medium opacity-60 italic text-center">Use your chosen PIN to sign in below.</p>
                </motion.div>
              )}
              
              <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h2>
                <p className="text-slate-500 mb-8">Access your funds securely.</p>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Account Number</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. 123456"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                      value={loginForm.accountNumber}
                      onChange={e => setLoginForm({...loginForm, accountNumber: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Security PIN</label>
                    <input 
                      type="password" 
                      required
                      placeholder="••••"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                      value={loginForm.pin}
                      onChange={e => setLoginForm({...loginForm, pin: e.target.value})}
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? "Authenticating..." : "Sign In"}
                  </button>
                </form>
                <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                  <p className="text-slate-500">Don't have an account?</p>
                  <button 
                    onClick={() => setView("register")}
                    className="text-blue-600 font-bold mt-2 hover:underline inline-flex items-center gap-1"
                  >
                    Open New Account <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {view === "register" && (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto mt-12"
            >
              <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">New Account</h2>
                <p className="text-slate-500 mb-8">Join Apex Bank in seconds.</p>
                <form onSubmit={handleRegister} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="John Doe"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                      value={regForm.holderName}
                      onChange={e => setRegForm({...regForm, holderName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Set Security PIN</label>
                    <input 
                      type="password" 
                      required
                      maxLength={4}
                      placeholder="4 Digits"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                      value={regForm.pin}
                      onChange={e => setRegForm({...regForm, pin: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Initial Deposit (₹)</label>
                    <input 
                      type="number" 
                      required
                      min={0}
                      placeholder="100.00"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                      value={regForm.initialDeposit}
                      onChange={e => setRegForm({...regForm, initialDeposit: e.target.value})}
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? "Processing..." : "Create Account"}
                  </button>
                </form>
                <button 
                  onClick={() => setView("login")}
                  className="w-full text-slate-500 font-medium mt-4 hover:text-slate-800 transition-colors"
                >
                  Go Back to Login
                </button>
              </div>
            </motion.div>
          )}

          {view === "dashboard" && account && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Header Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden shadow-xl">
                  <div className="relative z-10">
                    <p className="text-slate-400 font-medium mb-1">Available Balance</p>
                    <h3 className="text-5xl font-bold mb-8">
                      ₹{account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </h3>
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Account Number</p>
                        <p className="text-lg font-mono font-medium tracking-wider">
                          **** **** {account.accountNumber.slice(-4)}
                        </p>
                      </div>
                      <div className="w-12 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded flex flex-col justify-end p-1">
                         <div className="w-2 h-2 bg-yellow-200/50 rounded-full" />
                      </div>
                    </div>
                  </div>
                  <Wallet className="absolute -right-8 -bottom-8 w-64 h-64 text-slate-800 opacity-50" />
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50">
                  <h4 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <ArrowDownLeft className="w-4 h-4 text-blue-500" /> Executive Actions
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setAmount(account.balance.toString())}
                      className="p-4 bg-slate-50 hover:bg-blue-50 rounded-2xl transition-colors text-center group"
                    >
                      <CreditCard className="w-6 h-6 text-slate-400 group-hover:text-blue-500 mx-auto mb-2" />
                      <span className="text-xs font-bold text-slate-600">Quick Pay</span>
                    </button>
                    <button 
                      className="p-4 bg-slate-50 hover:bg-blue-50 rounded-2xl transition-colors text-center group"
                    >
                      <PlusCircle className="w-6 h-6 text-slate-400 group-hover:text-blue-500 mx-auto mb-2" />
                      <span className="text-xs font-bold text-slate-600">Add Card</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Transaction Controls */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50">
                    <h4 className="text-lg font-bold text-slate-900 mb-6">New Transaction</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-slate-600 block mb-2">Amount (₹)</label>
                        <input 
                          type="number" 
                          placeholder="0.00"
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-lg"
                          value={amount}
                          onChange={e => setAmount(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-600 block mb-2">Description (Optional)</label>
                        <input 
                          type="text" 
                          placeholder="Lunch, Utilities, etc."
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          value={desc}
                          onChange={e => setDesc(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <button 
                          onClick={() => handleTransaction("deposit")}
                          disabled={loading || !amount}
                          className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                        >
                          <ArrowDownLeft className="w-5 h-5" /> Deposit
                        </button>
                        <button 
                          onClick={() => handleTransaction("withdrawal")}
                          disabled={loading || !amount}
                          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                        >
                          <ArrowUpRight className="w-5 h-5" /> Withdraw
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* History */}
                <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <History className="w-5 h-5 text-blue-500" /> Transaction History
                    </h4>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Updates</span>
                  </div>
                  <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
                    {account.transactions.length === 0 ? (
                      <div className="p-12 text-center">
                        <History className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                        <p className="text-slate-400 font-medium">No activity yet.</p>
                      </div>
                    ) : (
                      account.transactions.map((t, idx) => (
                        <div key={t.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                              t.type === "deposit" ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-600"
                            }`}>
                              {t.type === "deposit" ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{t.description}</p>
                              <p className="text-xs text-slate-400 font-medium">
                                {new Date(t.date).toLocaleDateString()} at {new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${
                              t.type === "deposit" ? "text-emerald-600" : "text-slate-900"
                            }`}>
                              {t.type === "deposit" ? "+" : "-"}₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Verified</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
