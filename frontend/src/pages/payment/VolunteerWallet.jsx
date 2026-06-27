import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign, TrendingUp, CheckCircle, Clock, Lock,
  RefreshCw, AlertCircle, Wallet, ArrowDownCircle, X
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  return res.json();
};

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtDateTime = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

const payStatusCfg = {
  Pending:  { cls: 'bg-amber-100 text-amber-700',  label: 'Pending'     },
  Escrowed: { cls: 'bg-indigo-100 text-indigo-700', label: '🔒 Secured'  },
  Released: { cls: 'bg-green-100 text-green-700',   label: '✅ Paid'     },
  Refunded: { cls: 'bg-gray-100 text-gray-600',     label: 'Refunded'   },
  Failed:   { cls: 'bg-red-100 text-red-700',       label: 'Failed'     },
};

const VolunteerWallet = () => {
  const [wallet,       setWallet]       = useState(null);
  const [payments,     setPayments]     = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [activeTab,    setActiveTab]    = useState('payments'); // 'payments' | 'transactions'

  const load = useCallback(async () => {
    setLoading(true);
    const data = await apiFetch('/api/payments/worker');
    if (data.success) {
      setWallet(data.data.wallet);
      setPayments(data.data.payments);
      setTransactions(data.data.transactions);
    } else {
      setError(data.message || 'Failed to load wallet.');
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, []);

  const escrowedPayments = payments.filter(p => p.status === 'Escrowed');
  const releasedPayments = payments.filter(p => p.status === 'Released');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">My Wallet</h1>
          <p className="text-gray-500 mt-1">Track your earnings and payment history</p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-semibold transition-all">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0" size={18} />
          <p className="text-red-700 text-sm">{error}</p>
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600"><X size={15} /></button>
        </div>
      )}

      {/* Wallet balance card */}
      {loading ? (
        <div className="bg-white rounded-2xl h-40 border border-gray-100 animate-pulse" />
      ) : (
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 rounded-2xl p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <Wallet size={18} className="text-indigo-200" />
              <p className="text-indigo-200 font-medium text-sm">Available Balance</p>
            </div>
            <p className="text-5xl font-black tracking-tight">{fmt(wallet?.balance)}</p>
            <div className="flex flex-wrap gap-6 mt-5 pt-5 border-t border-white/20">
              <div>
                <p className="text-indigo-200 text-xs font-medium">Total Earned</p>
                <p className="text-xl font-bold mt-0.5">{fmt(wallet?.totalEarned)}</p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs font-medium">Total Released</p>
                <p className="text-xl font-bold mt-0.5">{fmt(wallet?.totalReleased)}</p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs font-medium">In Escrow</p>
                <p className="text-xl font-bold mt-0.5">
                  {fmt(escrowedPayments.reduce((s, p) => s + p.amount, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stat cards row */}
      {!loading && (
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: 'Secured in Escrow', value: escrowedPayments.length, icon: Lock,          color: 'from-indigo-500 to-purple-600', sub: 'Awaiting release' },
            { label: 'Payments Received', value: releasedPayments.length, icon: CheckCircle,   color: 'from-green-500 to-emerald-600',  sub: 'Released to wallet' },
            { label: 'Total Transactions',value: transactions.length,     icon: ArrowDownCircle,color: 'from-blue-500 to-sky-600',       sub: 'All wallet activity' },
          ].map((c, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-all">
              <div className={`w-12 h-12 bg-gradient-to-br ${c.color} rounded-xl flex items-center justify-center text-white shadow-md flex-shrink-0`}>
                <c.icon size={20} />
              </div>
              <div>
                <p className="text-gray-500 text-xs font-medium">{c.label}</p>
                <p className="text-2xl font-extrabold text-gray-900">{c.value}</p>
                <p className="text-xs text-gray-400">{c.sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: 'payments',     label: `Gig Payments (${payments.length})` },
          { id: 'transactions', label: `Wallet Transactions (${transactions.length})` },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Payments tab */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : payments.length === 0 ? (
            <div className="p-16 text-center">
              <DollarSign size={48} className="mx-auto text-gray-200 mb-3" />
              <p className="font-semibold text-gray-500">No payments yet</p>
              <p className="text-sm text-gray-400 mt-1">Get hired for a gig to see payments here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-3 font-bold text-gray-600 text-xs uppercase">Organiser</th>
                    <th className="px-5 py-3 font-bold text-gray-600 text-xs uppercase">Job</th>
                    <th className="px-5 py-3 font-bold text-gray-600 text-xs uppercase">Amount</th>
                    <th className="px-5 py-3 font-bold text-gray-600 text-xs uppercase">Status</th>
                    <th className="px-5 py-3 font-bold text-gray-600 text-xs uppercase">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => {
                    const cfg = payStatusCfg[p.status] || payStatusCfg.Pending;
                    return (
                      <tr key={p._id} className="border-b border-gray-50 hover:bg-indigo-50/20 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.organizerId?.profilePicture || `https://i.pravatar.cc/150?u=${p.organizerId?._id}`}
                              alt={p.organizerId?.fullName}
                              className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                            />
                            <div>
                              <p className="font-semibold text-gray-900">{p.organizerId?.fullName}</p>
                              <p className="text-xs text-gray-400">{p.organizerId?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-800 max-w-[180px] truncate">{p.jobId?.title}</p>
                          <p className="text-xs text-gray-400">{p.jobId?.location?.city} • {fmtDate(p.jobId?.date)}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-extrabold text-gray-900 text-base">{fmt(p.amount)}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${cfg.cls}`}>{cfg.label}</span>
                        </td>
                        <td className="px-5 py-4 text-gray-500 text-xs">
                          {p.status === 'Released' ? fmtDate(p.releasedAt) : fmtDate(p.escrowedAt || p.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Transactions tab */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : transactions.length === 0 ? (
            <div className="p-16 text-center">
              <ArrowDownCircle size={48} className="mx-auto text-gray-200 mb-3" />
              <p className="font-semibold text-gray-500">No transactions yet</p>
              <p className="text-sm text-gray-400 mt-1">Wallet credits appear here when organiser releases payment</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {transactions.map(tx => (
                <div key={tx._id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-all">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    tx.type === 'Credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {tx.type === 'Credit' ? <ArrowDownCircle size={18} /> : <TrendingUp size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{tx.description}</p>
                    <p className="text-xs text-gray-400">{fmtDateTime(tx.createdAt)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-extrabold text-base ${tx.type === 'Credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'Credit' ? '+' : '-'}{fmt(tx.amount)}
                    </p>
                    <p className="text-xs text-gray-400">Bal: {fmt(tx.balanceAfter)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VolunteerWallet;