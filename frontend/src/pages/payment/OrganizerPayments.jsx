import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign, Lock, CheckCircle, Clock, AlertCircle,
  RefreshCw, TrendingUp, Users, Loader, X
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiFetch = async (path, options = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  return res.json();
};

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const statusCfg = {
  Pending:  { cls: 'bg-amber-100 text-amber-700',  label: 'Pending'   },
  Escrowed: { cls: 'bg-indigo-100 text-indigo-700', label: '🔒 Escrowed' },
  Released: { cls: 'bg-green-100 text-green-700',   label: '✅ Released' },
  Refunded: { cls: 'bg-gray-100 text-gray-600',     label: 'Refunded'  },
  Failed:   { cls: 'bg-red-100 text-red-700',       label: 'Failed'    },
};

const OrganizerPayments = () => {
  const [payments,  setPayments]  = useState([]);
  const [stats,     setStats]     = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [releasing, setReleasing] = useState(null); // paymentId being released
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const data = await apiFetch('/api/payments/organizer');
    if (data.success) {
      setPayments(data.data.payments);
      setStats(data.data.stats);
    } else {
      setError(data.message || 'Failed to load payments.');
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, []);

  const handleRelease = async (paymentId, amount) => {
    if (!window.confirm(`Release ${fmt(amount)} to the worker's wallet? This cannot be undone.`)) return;
    setReleasing(paymentId);
    setError('');
    const data = await apiFetch(`/api/payments/release/${paymentId}`, { method: 'POST' });
    if (data.success) {
      setSuccess(`${fmt(amount)} released to worker's wallet!`);
      load(); // refresh
    } else {
      setError(data.message || 'Release failed.');
    }
    setReleasing(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Payments</h1>
          <p className="text-gray-500 mt-1">Manage escrow and release payments to workers</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-semibold transition-all">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0" size={18} />
          <p className="text-red-700 text-sm">{error}</p>
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600"><X size={15} /></button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="text-green-500 flex-shrink-0" size={18} />
          <p className="text-green-700 text-sm font-semibold">{success}</p>
          <button onClick={() => setSuccess('')} className="ml-auto text-green-400 hover:text-green-600"><X size={15} /></button>
        </div>
      )}

      {/* Stat cards */}
      {loading ? (
        <div className="grid sm:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-28 border border-gray-100 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { label: 'Total Escrowed',  value: fmt(stats?.totalEscrowed),  icon: Lock,        color: 'from-indigo-500 to-purple-600', hint: `${stats?.countEscrowed || 0} active` },
            { label: 'Total Released',  value: fmt(stats?.totalReleased),  icon: CheckCircle, color: 'from-green-500 to-emerald-600', hint: `${stats?.countReleased || 0} released` },
            { label: 'Pending Orders',  value: fmt(stats?.totalPending),   icon: Clock,       color: 'from-amber-500 to-orange-500',  hint: 'Awaiting payment' },
          ].map((c, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-lg transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${c.color} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                  <c.icon size={22} />
                </div>
              </div>
              <p className="text-gray-500 text-sm font-medium">{c.label}</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">{c.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{c.hint}</p>
            </div>
          ))}
        </div>
      )}

      {/* How escrow works — info box */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-5">
        <h3 className="font-bold text-indigo-800 mb-2 flex items-center gap-2"><Lock size={16} /> How Pay-on-Hire Escrow Works</h3>
        <div className="grid sm:grid-cols-4 gap-3 text-xs text-indigo-700">
          {['1. You click "Hire & Pay" → Razorpay opens', '2. Payment held securely in Escrow', '3. Event happens → worker completes gig', '4. You click "Release Payment" → worker receives funds'].map((step, i) => (
            <div key={i} className="bg-white/60 rounded-xl p-3 font-medium">{step}</div>
          ))}
        </div>
      </div>

      {/* Payments table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg">Payment History</h3>
        </div>

        {loading ? (
          <div className="p-8 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : payments.length === 0 ? (
          <div className="p-16 text-center">
            <DollarSign size={48} className="mx-auto text-gray-200 mb-3" />
            <p className="font-semibold text-gray-500">No payments yet</p>
            <p className="text-sm text-gray-400 mt-1">Hire a volunteer to see payments here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 font-bold text-gray-600 text-xs uppercase">Worker</th>
                  <th className="px-5 py-3 font-bold text-gray-600 text-xs uppercase">Job</th>
                  <th className="px-5 py-3 font-bold text-gray-600 text-xs uppercase">Amount</th>
                  <th className="px-5 py-3 font-bold text-gray-600 text-xs uppercase">Status</th>
                  <th className="px-5 py-3 font-bold text-gray-600 text-xs uppercase">Escrowed On</th>
                  <th className="px-5 py-3 font-bold text-gray-600 text-xs uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => {
                  const cfg = statusCfg[p.status] || statusCfg.Pending;
                  return (
                    <tr key={p._id} className="border-b border-gray-50 hover:bg-indigo-50/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.workerId?.profilePicture || `https://i.pravatar.cc/150?u=${p.workerId?._id}`}
                            alt={p.workerId?.fullName}
                            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                          />
                          <div>
                            <p className="font-semibold text-gray-900">{p.workerId?.fullName}</p>
                            <p className="text-xs text-gray-400">{p.workerId?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-800 max-w-[180px] truncate">{p.jobId?.title}</p>
                        <p className="text-xs text-gray-400">{p.jobId?.location?.city} • {fmtDate(p.jobId?.date)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-extrabold text-gray-900 text-base">{fmt(p.amount)}</p>
                        <p className="text-xs text-gray-400">{p.currency}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${cfg.cls}`}>{cfg.label}</span>
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-xs">{fmtDate(p.escrowedAt)}</td>
                      <td className="px-5 py-4">
                        {p.status === 'Escrowed' && (
                          <button
                            onClick={() => handleRelease(p._id, p.amount)}
                            disabled={releasing === p._id}
                            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-xs hover:opacity-90 transition-all active:scale-95 disabled:opacity-60 shadow-sm shadow-indigo-200"
                          >
                            {releasing === p._id
                              ? <><Loader size={12} className="animate-spin" /> Releasing...</>
                              : <><DollarSign size={12} /> Release</>
                            }
                          </button>
                        )}
                        {p.status === 'Released' && (
                          <span className="text-xs text-green-600 font-semibold">{fmtDate(p.releasedAt)}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerPayments;