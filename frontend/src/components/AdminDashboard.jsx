import React, { useEffect, useState, useCallback } from 'react';
import {
  LayoutDashboard, Users, Briefcase, Shield, Bell, Menu, X,
  Search, Eye, CheckCircle, XCircle, Clock, AlertCircle,
  Loader, RefreshCw, ChevronLeft, ChevronRight, LogOut,
  TrendingUp, UserCheck, UserCog, Download, Trash2,
  CheckSquare, XSquare, Filter, Image
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─── API ──────────────────────────────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiFetch = async (path, options = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,

    // 🔥 VERY IMPORTANT → send cookies
    credentials: 'include',

    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await res.json();

  // 🔥 optional: handle auth failure globally
  if (res.status === 401) {
    console.log("Unauthorized - redirecting to login");
    window.location.href = "/login";
  }

  return data;
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmtDate     = (d) => d ? new Date(d).toLocaleDateString('en-IN')  : '—';
const fmtDateTime = (d) => d ? new Date(d).toLocaleString('en-IN')      : '—';

const kycStatusCfg = {
  pending:     { label: 'Pending',     cls: 'bg-gray-100 text-gray-600'    },
  in_progress: { label: 'Under Review',cls: 'bg-amber-100 text-amber-700'  },
  verified:    { label: 'Verified',    cls: 'bg-green-100 text-green-700'  },
  rejected:    { label: 'Rejected',    cls: 'bg-red-100 text-red-700'      },
  submitted:   { label: 'Submitted',   cls: 'bg-blue-100 text-blue-700'    },
  approved:    { label: 'Approved',    cls: 'bg-green-100 text-green-700'  },
  under_review:{ label: 'Under Review',cls: 'bg-amber-100 text-amber-700'  },
};

const KycBadge = ({ status }) => {
  const cfg = kycStatusCfg[status] || { label: status, cls: 'bg-gray-100 text-gray-600' };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>{cfg.label}</span>;
};

const RoleBadge = ({ role }) => {
  const cls = role === 'organizer' ? 'bg-purple-100 text-purple-700' : role === 'worker' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600';
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${cls}`}>{role}</span>;
};

const StatusBadge = ({ active }) => (
  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
    {active ? 'Active' : 'Inactive'}
  </span>
);

// ─── PAGINATION ───────────────────────────────────────────────────────────────
const Pagination = ({ page, pages, total, onPrev, onNext }) => (
  <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
    <span>{total} total &mdash; Page {page} of {Math.max(1, pages)}</span>
    <div className="flex gap-2">
      <button onClick={onPrev} disabled={page <= 1}
        className="rounded border px-2 py-1 disabled:opacity-40 hover:bg-slate-50">
        <ChevronLeft size={16} />
      </button>
      <button onClick={onNext} disabled={page >= pages}
        className="rounded border px-2 py-1 disabled:opacity-40 hover:bg-slate-50">
        <ChevronRight size={16} />
      </button>
    </div>
  </div>
);

// ─── METRIC CARD ─────────────────────────────────────────────────────────────
const MetricCard = ({ label, value, icon: Icon, color, hint, loading }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center`}>
        <Icon size={22} className="text-white" />
      </div>
    </div>
    <p className="text-sm text-slate-500 font-medium">{label}</p>
    {loading ? (
      <div className="h-8 bg-slate-100 rounded animate-pulse mt-2 w-24" />
    ) : (
      <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
    )}
    {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
  </div>
);

// ─── TOAST ────────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onDismiss }) => (
  <div onClick={onDismiss}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg cursor-pointer text-sm font-medium ${
      type === 'success' ? 'bg-green-600 text-white' :
      type === 'error'   ? 'bg-red-600 text-white'   :
                           'bg-slate-800 text-white'
    }`}>
    {type === 'success' && <CheckCircle size={16} />}
    {type === 'error'   && <XCircle     size={16} />}
    {message}
  </div>
);

// ─── KYC DOCUMENT VIEWER MODAL ────────────────────────────────────────────────
const KycDetailModal = ({ submission, onClose, onReview }) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showReject,   setShowReject]   = useState(false);
  const [loading,      setLoading]      = useState(false);

  if (!submission) return null;
  const user = submission.userId;

  const handleAction = async (action) => {
    if (action === 'reject' && !rejectReason.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }
    setLoading(true);
    await onReview(submission._id, action, rejectReason);
    setLoading(false);
    onClose();
  };

  const DocImage = ({ label, src }) => {
    if (!src) return null;
    return (
      <div>
        <p className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{label}</p>
        <img src={src} alt={label}
          className="w-full rounded-xl border border-slate-200 object-cover max-h-48 bg-slate-100" />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b sticky top-0 bg-white/95 backdrop-blur z-10 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-slate-900">KYC Submission Review</h3>
            <p className="text-sm text-slate-500 mt-0.5">{user?.fullName} • {user?.email}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
            <X size={22} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* User info */}
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { label: 'Full Name',    value: submission.fullName },
              { label: 'Date of Birth',value: submission.dateOfBirth },
              { label: 'Role',         value: <RoleBadge role={user?.role || submission.role} /> },
              { label: 'Phone',        value: user?.phone },
              { label: 'Email',        value: user?.email },
              { label: 'Submitted',    value: fmtDateTime(submission.submittedAt) },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400 font-medium mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-slate-800">{value || '—'}</p>
              </div>
            ))}
          </div>

          {/* Address */}
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-400 font-medium mb-0.5">Address</p>
            <p className="text-sm font-semibold text-slate-800">{submission.address}</p>
          </div>

          {/* ID numbers */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-400 font-medium mb-0.5">Aadhaar Number</p>
              <p className="text-sm font-mono font-bold text-slate-800 tracking-widest">
                {'•'.repeat(8)}{submission.aadhaarNumber?.slice(-4)}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-400 font-medium mb-0.5">PAN Number</p>
              <p className="text-sm font-mono font-bold text-slate-800 tracking-widest">{submission.panNumber}</p>
            </div>
          </div>

          {/* Documents */}
          <div>
            <h4 className="font-bold text-slate-800 mb-3">Uploaded Documents</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <DocImage label="Aadhaar Front" src={submission.aadhaarFront} />
              <DocImage label="Aadhaar Back"  src={submission.aadhaarBack}  />
              <DocImage label="PAN Card"      src={submission.panFront}     />
              <DocImage label="Selfie with Aadhaar" src={submission.selfie} />
              {submission.gstCertificate && (
                <DocImage label="GST Certificate" src={submission.gstCertificate} />
              )}
            </div>
          </div>

          {/* Rejection reason if rejected */}
          {submission.status === 'rejected' && submission.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-red-700 mb-1">Rejection Reason</p>
              <p className="text-sm text-red-600">{submission.rejectionReason}</p>
            </div>
          )}

          {/* Action area — only for submitted / under_review */}
          {(submission.status === 'submitted' || submission.status === 'under_review') && (
            <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-slate-50">
              <p className="font-semibold text-slate-800">Review Decision</p>

              {showReject && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-400 outline-none"
                    placeholder="e.g., Aadhaar image is blurry. Please upload a clearer photo."
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => handleAction('approve')}
                  disabled={loading || showReject}
                  className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <Loader size={16} className="animate-spin" /> : <CheckSquare size={16} />}
                  Approve KYC
                </button>

                {!showReject ? (
                  <button
                    onClick={() => setShowReject(true)}
                    className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-2">
                    <XSquare size={16} /> Reject KYC
                  </button>
                ) : (
                  <div className="flex gap-2 flex-1">
                    <button
                      onClick={() => handleAction('reject')}
                      disabled={loading}
                      className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                      {loading ? <Loader size={16} className="animate-spin" /> : <XSquare size={16} />}
                      Confirm Reject
                    </button>
                    <button
                      onClick={() => { setShowReject(false); setRejectReason(''); }}
                      className="px-4 py-2.5 border border-slate-300 rounded-xl font-semibold text-sm hover:bg-slate-100 transition-all">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Already reviewed */}
          {(submission.status === 'approved' || submission.status === 'rejected') && (
            <div className={`border rounded-xl p-4 ${submission.status === 'approved' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2">
                {submission.status === 'approved'
                  ? <CheckCircle className="text-green-600" size={20} />
                  : <XCircle    className="text-red-600"   size={20} />}
                <p className={`font-bold ${submission.status === 'approved' ? 'text-green-800' : 'text-red-800'}`}>
                  KYC {submission.status === 'approved' ? 'Approved' : 'Rejected'}
                </p>
              </div>
              {submission.reviewedAt && (
                <p className="text-xs text-slate-500 mt-1">Reviewed on {fmtDateTime(submission.reviewedAt)}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── USER DETAIL MODAL ────────────────────────────────────────────────────────
const UserDetailModal = ({ user, onClose, onToggleStatus }) => {
  if (!user) return null;
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    await onToggleStatus(user._id);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900">User Details</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={22} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <img src={`https://i.pravatar.cc/150?u=${user.email}`} alt={user.fullName} className="w-16 h-16 rounded-full" />
            <div>
              <p className="text-lg font-bold text-slate-900">{user.fullName}</p>
              <div className="flex items-center gap-2 mt-1">
                <RoleBadge role={user.role} />
                <StatusBadge active={user.isActive} />
                <KycBadge status={user.kycStatus} />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: 'Email',      value: user.email },
              { label: 'Phone',      value: user.phone },
              { label: 'Joined',     value: fmtDate(user.createdAt) },
              { label: 'Last Login', value: fmtDateTime(user.lastLogin) },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-sm font-semibold text-slate-800">{value || '—'}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 border-t flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-slate-50">Close</button>
          {user.role !== 'admin' && (
            <button onClick={handleToggle} disabled={loading}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-60 ${
                user.isActive
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}>
              {loading ? <Loader size={14} className="animate-spin" /> : null}
              {user.isActive ? 'Deactivate User' : 'Activate User'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── JOB DETAIL MODAL ─────────────────────────────────────────────────────────
const JobDetailModal = ({ job, onClose, onDelete, onStatusChange }) => {
  if (!job) return null;
  const [loading, setLoading] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900">Job Details</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={22} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <h4 className="font-bold text-slate-900 text-lg">{job.title}</h4>
            <p className="text-sm text-slate-500 mt-0.5">by {job.organizerId?.fullName}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: 'City',       value: job.location?.city },
              { label: 'Date',       value: fmtDate(job.date) },
              { label: 'Pay',        value: `₹${job.pay?.amount?.toLocaleString('en-IN')} ${job.pay?.type === 'per_day' ? '/day' : job.pay?.type === 'per_hour' ? '/hr' : ''}` },
              { label: 'Slots',      value: `${job.slotsFilled}/${job.slotsTotal} filled` },
              { label: 'Applicants', value: job.applicantCount },
              { label: 'Category',   value: job.category },
              { label: 'Status',     value: job.status },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-sm font-semibold text-slate-800">{value || '—'}</p>
              </div>
            ))}
          </div>
          {job.description && (
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-400 mb-1">Description</p>
              <p className="text-sm text-slate-700">{job.description}</p>
            </div>
          )}
        </div>
        <div className="p-6 border-t flex gap-3 justify-end flex-wrap">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-slate-50">Close</button>
          {job.status === 'Active' ? (
            <button onClick={() => { onStatusChange(job._id, 'Paused'); onClose(); }}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold hover:bg-amber-700">
              Pause Job
            </button>
          ) : job.status === 'Paused' ? (
            <button onClick={() => { onStatusChange(job._id, 'Active'); onClose(); }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700">
              Activate Job
            </button>
          ) : null}
          <button onClick={() => { onDelete(job._id); onClose(); }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 flex items-center gap-2">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN ADMIN DASHBOARD ─────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();

  const [activeTab,  setActiveTab]  = useState('overview');
  const [sidebarOpen,setSidebarOpen]= useState(false);
  const [toasts,     setToasts]     = useState([]);

  // Dashboard stats
  const [dashStats,   setDashStats]  = useState(null);
  const [loadingDash, setLoadingDash]= useState(true);

  // Users tab
  const [users,       setUsers]       = useState([]);
  const [userTotal,   setUserTotal]   = useState(0);
  const [userPage,    setUserPage]    = useState(1);
  const [userPages,   setUserPages]   = useState(1);
  const [userSearch,  setUserSearch]  = useState('');
  const [userRole,    setUserRole]    = useState('');
  const [userKycFilter, setUserKycFilter] = useState('');
  const [loadingUsers, setLoadingUsers]   = useState(false);
  const [selectedUser, setSelectedUser]   = useState(null);

  // KYC tab
  const [kycSubmissions,  setKycSubmissions]  = useState([]);
  const [kycTotal,        setKycTotal]        = useState(0);
  const [kycPage,         setKycPage]         = useState(1);
  const [kycPages,        setKycPages]        = useState(1);
  const [kycFilter,       setKycFilter]       = useState('submitted');
  const [loadingKyc,      setLoadingKyc]      = useState(false);
  const [selectedKyc,     setSelectedKyc]     = useState(null);

  // Jobs tab
  const [jobs,         setJobs]         = useState([]);
  const [jobTotal,     setJobTotal]     = useState(0);
  const [jobPage,      setJobPage]      = useState(1);
  const [jobPages,     setJobPages]     = useState(1);
  const [jobSearch,    setJobSearch]    = useState('');
  const [jobStatus,    setJobStatus]    = useState('');
  const [loadingJobs,  setLoadingJobs]  = useState(false);
  const [selectedJob,  setSelectedJob]  = useState(null);

  // ── Toast helper ────────────────────────────────────────────────────────────
  const pushToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const handleLogout = () => {
    ['token','userRole','userId','userName','userEmail'].forEach(k => localStorage.removeItem(k));
    navigate('/login');
  };

  // ── Fetch dashboard stats ────────────────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    setLoadingDash(true);
    const data = await apiFetch('/api/admin/dashboard');
    if (data.success) setDashStats(data.data);
    else pushToast('Failed to load dashboard.', 'error');
    setLoadingDash(false);

    console.log("DASHBOARD DATA:", data);
  }, []);

  // ── Fetch users ──────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async (page = 1) => {
    setLoadingUsers(true);
    let url = `/api/admin/users?page=${page}&limit=15`;
    if (userSearch)    url += `&search=${encodeURIComponent(userSearch)}`;
    if (userRole)      url += `&role=${userRole}`;
    if (userKycFilter) url += `&kycStatus=${userKycFilter}`;
    const data = await apiFetch(url);
    if (data.success) {
      setUsers(data.data.users);
      setUserTotal(data.data.total);
      setUserPages(data.data.pages);
    }
    setLoadingUsers(false);
  }, [userSearch, userRole, userKycFilter]);

  // ── Fetch KYC submissions ────────────────────────────────────────────────────
  const fetchKyc = useCallback(async (page = 1) => {
    setLoadingKyc(true);
    const data = await apiFetch(`/api/kyc/admin/all?status=${kycFilter}&page=${page}&limit=15`);
    if (data.success) {
      setKycSubmissions(data.data.submissions);
      setKycTotal(data.data.total);
      setKycPages(Math.ceil(data.data.total / 15));
    }
    setLoadingKyc(false);
  }, [kycFilter]);

  // ── Fetch jobs ───────────────────────────────────────────────────────────────
  const fetchJobs = useCallback(async (page = 1) => {
    setLoadingJobs(true);
    let url = `/api/admin/jobs?page=${page}&limit=15`;
    if (jobSearch) url += `&search=${encodeURIComponent(jobSearch)}`;
    if (jobStatus) url += `&status=${jobStatus}`;
    const data = await apiFetch(url);
    if (data.success) {
      setJobs(data.data.jobs);
      setJobTotal(data.data.total);
      setJobPages(data.data.pages);
    }
    setLoadingJobs(false);
  }, [jobSearch, jobStatus]);

  // Initial loads
  useEffect(() => { fetchDashboard(); }, []);
  useEffect(() => { if (activeTab === 'users') { setUserPage(1); fetchUsers(1); } }, [activeTab, userSearch, userRole, userKycFilter]);
  useEffect(() => { if (activeTab === 'kyc')   { setKycPage(1);  fetchKyc(1);   } }, [activeTab, kycFilter]);
  useEffect(() => { if (activeTab === 'jobs')  { setJobPage(1);  fetchJobs(1);  } }, [activeTab, jobSearch, jobStatus]);

  // ── User actions ─────────────────────────────────────────────────────────────
  const handleToggleUserStatus = async (userId) => {
    const data = await apiFetch(`/api/admin/users/${userId}/status`, { method: 'PATCH' });
    if (data.success) { pushToast(data.message); fetchUsers(userPage); fetchDashboard(); }
    else pushToast(data.message || 'Failed.', 'error');
  };

  // ── KYC review ───────────────────────────────────────────────────────────────
  const handleKycReview = async (submissionId, action, rejectionReason = '') => {
    const data = await apiFetch(`/api/kyc/admin/${submissionId}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ action, rejectionReason }),
    });
    if (data.success) {
      pushToast(`KYC ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
      fetchKyc(kycPage);
      fetchDashboard();
    } else {
      pushToast(data.message || 'Review failed.', 'error');
    }
  };

  // ── Job actions ──────────────────────────────────────────────────────────────
  const handleJobStatusChange = async (jobId, status) => {
    const data = await apiFetch(`/api/admin/jobs/${jobId}/status`, {
      method: 'PATCH', body: JSON.stringify({ status }),
    });
    if (data.success) { pushToast('Job status updated.'); fetchJobs(jobPage); fetchDashboard(); }
    else pushToast('Failed.', 'error');
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Delete this job and all its applications?')) return;
    const data = await apiFetch(`/api/admin/jobs/${jobId}`, { method: 'DELETE' });
    if (data.success) { pushToast('Job deleted.'); fetchJobs(jobPage); fetchDashboard(); }
    else pushToast('Delete failed.', 'error');
  };

  // ── Load full KYC submission for modal ───────────────────────────────────────
  const openKycModal = async (submissionId) => {
    const data = await apiFetch(`/api/kyc/admin/${submissionId}`);
    if (data.success) setSelectedKyc(data.data.submission);
    else pushToast('Failed to load submission.', 'error');
  };

  // ── Sidebar tabs ──────────────────────────────────────────────────────────────
  const TABS = [
    { id: 'overview',  label: 'Overview',      icon: LayoutDashboard },
    { id: 'kyc',       label: 'KYC Reviews',   icon: Shield          },
    { id: 'users',     label: 'Users',         icon: Users           },
    { id: 'jobs',      label: 'Jobs',          icon: Briefcase       },
    { id: 'analytics', label: 'Analytics',     icon: TrendingUp      },
  ];

  const pendingKycCount = dashStats?.stats?.pendingKyc || 0;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-[70] space-y-2">
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} onDismiss={() => setToasts(p => p.filter(x => x.id !== t.id))} />
        ))}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <button className="rounded border p-2 lg:hidden" onClick={() => setSidebarOpen(p => !p)}>
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="text-white" size={18} />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 leading-tight">GigXpress Admin</h1>
                <p className="text-xs text-slate-400">Operations console</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pendingKycCount > 0 && (
              <button onClick={() => setActiveTab('kyc')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold hover:bg-amber-100 transition-all">
                <Clock size={12} /> {pendingKycCount} KYC Pending
              </button>
            )}
            <button onClick={() => { fetchDashboard(); }}
              className="p-2 border rounded-lg hover:bg-slate-50 text-slate-500 transition-all">
              <RefreshCw size={16} />
            </button>
            <button onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px]">
        {/* Sidebar */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        <aside className={`fixed inset-y-0 left-0 z-30 w-60 border-r bg-white p-4 pt-20 transition-transform lg:static lg:translate-x-0 lg:pt-4 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <nav className="space-y-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all ${
                  activeTab === id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}>
                <Icon size={17} strokeWidth={activeTab === id ? 2.5 : 2} />
                {label}
                {id === 'kyc' && pendingKycCount > 0 && (
                  <span className="ml-auto bg-amber-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {pendingKycCount > 9 ? '9+' : pendingKycCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="w-full flex-1 p-4 lg:p-6">

          {/* ═══ OVERVIEW ═══ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-extrabold text-slate-900">Platform Overview</h1>
                <button onClick={fetchDashboard}
                  className="flex items-center gap-2 px-3 py-2 border rounded-xl hover:bg-slate-50 text-sm font-semibold transition-all">
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>

              {/* Stats grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="Total Users"     value={dashStats?.stats?.totalUsers || 0}         icon={Users}    color="bg-indigo-500"   hint="Workers + Organizers" loading={loadingDash} />
                <MetricCard label="Total Volunteers"value={dashStats?.stats?.totalWorkers || 0}       icon={UserCheck} color="bg-blue-500"    hint="Registered workers"   loading={loadingDash} />
                <MetricCard label="Organizers"      value={dashStats?.stats?.totalOrganizers || 0}    icon={UserCog}  color="bg-purple-500"   hint="Event organisers"     loading={loadingDash} />
                <MetricCard label="KYC Pending"     value={dashStats?.stats?.pendingKyc || 0}         icon={Shield}   color="bg-amber-500"    hint="Awaiting review"      loading={loadingDash} />
                <MetricCard label="Total Jobs"       value={dashStats?.stats?.totalJobs || 0}          icon={Briefcase}color="bg-green-500"    hint="All job postings"     loading={loadingDash} />
                <MetricCard label="Active Jobs"      value={dashStats?.stats?.activeJobs || 0}         icon={TrendingUp}color="bg-emerald-500" hint="Currently live"       loading={loadingDash} />
                <MetricCard label="Applications"     value={dashStats?.stats?.totalApplications || 0} icon={CheckCircle}color="bg-sky-500"    hint="All time total"       loading={loadingDash} />
                <MetricCard label="KYC In Review"    value={0}                                          icon={Clock}    color="bg-orange-500"   hint="Being processed"     loading={loadingDash} />
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><Users size={17} className="text-indigo-500" /> Recent Registrations</h3>
                    <button onClick={() => setActiveTab('users')} className="text-xs text-indigo-600 font-semibold hover:underline">View all</button>
                  </div>
                  {loadingDash ? (
                    <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />)}</div>
                  ) : (dashStats?.recentUsers || []).length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-6">No users yet</p>
                  ) : (
                    <div className="space-y-2">
                      {(dashStats?.recentUsers || []).map(u => (
                        <div key={u._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all">
                          <div className="flex items-center gap-3">
                            <img src={`https://i.pravatar.cc/150?u=${u.email}`} className="w-8 h-8 rounded-full" alt={u.fullName} />
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{u.fullName}</p>
                              <p className="text-xs text-slate-400">{u.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <RoleBadge role={u.role} />
                            <KycBadge  status={u.kycStatus} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Jobs */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><Briefcase size={17} className="text-indigo-500" /> Recent Jobs</h3>
                    <button onClick={() => setActiveTab('jobs')} className="text-xs text-indigo-600 font-semibold hover:underline">View all</button>
                  </div>
                  {loadingDash ? (
                    <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />)}</div>
                  ) : (dashStats?.recentJobs || []).length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-6">No jobs yet</p>
                  ) : (
                    <div className="space-y-2">
                      {(dashStats?.recentJobs || []).map(job => (
                        <div key={job._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{job.title}</p>
                            <p className="text-xs text-slate-400">{job.organizerId?.fullName} • {job.location?.city}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              job.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                            }`}>{job.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Action: KYC Pending */}
              {pendingKycCount > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Shield className="text-amber-600" size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-amber-800">{pendingKycCount} KYC Submission{pendingKycCount !== 1 ? 's' : ''} Awaiting Review</p>
                      <p className="text-sm text-amber-600">Review user documents to unlock job posting and applications</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('kyc')}
                    className="flex-shrink-0 px-5 py-2.5 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 transition-all">
                    Review Now →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ═══ KYC REVIEWS ═══ */}
          {activeTab === 'kyc' && (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-extrabold text-slate-900">KYC Reviews</h1>
                <button onClick={() => fetchKyc(kycPage)}
                  className="flex items-center gap-2 px-3 py-2 border rounded-xl hover:bg-slate-50 text-sm font-semibold transition-all">
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>

              {/* Status filter tabs */}
              <div className="flex flex-wrap gap-2">
                {[
                  { val: 'submitted',    label: 'Pending Review' },
                  { val: 'under_review', label: 'Under Review'   },
                  { val: 'approved',     label: 'Approved'       },
                  { val: 'rejected',     label: 'Rejected'       },
                  { val: 'all',          label: 'All'            },
                ].map(({ val, label }) => (
                  <button key={val}
                    onClick={() => { setKycFilter(val); setKycPage(1); }}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      kycFilter === val ? 'bg-indigo-600 text-white' : 'border border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* KYC table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loadingKyc ? (
                  <div className="p-8 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}</div>
                ) : kycSubmissions.length === 0 ? (
                  <div className="p-16 text-center">
                    <Shield size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium">No submissions in this category</p>
                    <p className="text-sm text-slate-400 mt-1">Try a different filter above</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase">User</th>
                          <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase">Role</th>
                          <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase">Aadhaar (masked)</th>
                          <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase">PAN</th>
                          <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase">Submitted</th>
                          <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase">Status</th>
                          <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kycSubmissions.map(sub => {
                          const user = sub.userId;
                          return (
                            <tr key={sub._id} className="border-b border-slate-100 hover:bg-slate-50 transition-all">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <img src={`https://i.pravatar.cc/150?u=${user?.email}`} className="w-8 h-8 rounded-full" alt={user?.fullName} />
                                  <div>
                                    <p className="font-semibold text-slate-900">{sub.fullName}</p>
                                    <p className="text-xs text-slate-400">{user?.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3"><RoleBadge role={user?.role || sub.role} /></td>
                              <td className="px-4 py-3 font-mono text-sm text-slate-600">
                                {'•'.repeat(8)}{sub.aadhaarNumber?.slice(-4)}
                              </td>
                              <td className="px-4 py-3 font-mono text-sm text-slate-600">{sub.panNumber}</td>
                              <td className="px-4 py-3 text-slate-500 text-xs">{fmtDateTime(sub.submittedAt)}</td>
                              <td className="px-4 py-3"><KycBadge status={sub.status} /></td>
                              <td className="px-4 py-3">
                                <button onClick={() => openKycModal(sub._id)}
                                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-1.5">
                                  <Eye size={12} /> Review
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {kycTotal > 15 && (
                  <div className="px-4 pb-4">
                    <Pagination page={kycPage} pages={kycPages} total={kycTotal}
                      onPrev={() => { setKycPage(p => p - 1); fetchKyc(kycPage - 1); }}
                      onNext={() => { setKycPage(p => p + 1); fetchKyc(kycPage + 1); }} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ USERS ═══ */}
          {activeTab === 'users' && (
            <div className="space-y-5">
              <h1 className="text-2xl font-extrabold text-slate-900">User Management</h1>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-52">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                    placeholder="Search name, email, phone..."
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                </div>
                <select value={userRole} onChange={e => setUserRole(e.target.value)}
                  className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 outline-none bg-white">
                  <option value="">All Roles</option>
                  <option value="worker">Worker</option>
                  <option value="organizer">Organizer</option>
                </select>
                <select value={userKycFilter} onChange={e => setUserKycFilter(e.target.value)}
                  className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 outline-none bg-white">
                  <option value="">All KYC Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loadingUsers ? (
                  <div className="p-8 space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}</div>
                ) : users.length === 0 ? (
                  <div className="p-16 text-center">
                    <Users size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium">No users found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase">User</th>
                          <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase">Phone</th>
                          <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase">Role</th>
                          <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase">KYC Status</th>
                          <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase">Account</th>
                          <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase">Joined</th>
                          <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
                          <tr key={user._id} className="border-b border-slate-100 hover:bg-slate-50 transition-all">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <img src={`https://i.pravatar.cc/150?u=${user.email}`} className="w-8 h-8 rounded-full" alt={user.fullName} />
                                <div>
                                  <p className="font-semibold text-slate-900">{user.fullName}</p>
                                  <p className="text-xs text-slate-400">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{user.phone}</td>
                            <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                            <td className="px-4 py-3"><KycBadge status={user.kycStatus} /></td>
                            <td className="px-4 py-3"><StatusBadge active={user.isActive} /></td>
                            <td className="px-4 py-3 text-slate-500 text-xs">{fmtDate(user.createdAt)}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button onClick={() => setSelectedUser(user)}
                                  className="p-1.5 rounded-lg border hover:bg-slate-50 text-slate-600 transition-all">
                                  <Eye size={14} />
                                </button>
                                {user.role !== 'admin' && (
                                  <button onClick={() => handleToggleUserStatus(user._id)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                      user.isActive
                                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                                    }`}>
                                    {user.isActive ? 'Disable' : 'Enable'}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {userTotal > 15 && (
                  <div className="px-4 pb-4">
                    <Pagination page={userPage} pages={userPages} total={userTotal}
                      onPrev={() => { setUserPage(p => p - 1); fetchUsers(userPage - 1); }}
                      onNext={() => { setUserPage(p => p + 1); fetchUsers(userPage + 1); }} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ JOBS ═══ */}
          {activeTab === 'jobs' && (
            <div className="space-y-5">
              <h1 className="text-2xl font-extrabold text-slate-900">Job Management</h1>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-52">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={jobSearch} onChange={e => setJobSearch(e.target.value)}
                    placeholder="Search by title..."
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                </div>
                <select value={jobStatus} onChange={e => setJobStatus(e.target.value)}
                  className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 outline-none bg-white">
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loadingJobs ? (
                  <div className="p-8 space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}</div>
                ) : jobs.length === 0 ? (
                  <div className="p-16 text-center">
                    <Briefcase size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium">No jobs found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase">Job</th>
                          <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase">Organiser</th>
                          <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase">City</th>
                          <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase">Date</th>
                          <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase">Pay</th>
                          <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase">Slots</th>
                          <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase">Apps</th>
                          <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase">Status</th>
                          <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.map(job => (
                          <tr key={job._id} className="border-b border-slate-100 hover:bg-slate-50 transition-all">
                            <td className="px-4 py-3">
                              <p className="font-semibold text-slate-900 max-w-[160px] truncate">{job.title}</p>
                              <p className="text-xs text-slate-400">{job.category}</p>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{job.organizerId?.fullName || '—'}</td>
                            <td className="px-4 py-3 text-slate-600">{job.location?.city}</td>
                            <td className="px-4 py-3 text-slate-500 text-xs">{fmtDate(job.date)}</td>
                            <td className="px-4 py-3 font-semibold text-slate-800">
                              ₹{job.pay?.amount?.toLocaleString('en-IN')}
                              <span className="font-normal text-slate-400 text-xs">
                                {job.pay?.type === 'per_day' ? '/day' : job.pay?.type === 'per_hour' ? '/hr' : ''}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{job.slotsFilled}/{job.slotsTotal}</td>
                            <td className="px-4 py-3 text-slate-600">{job.applicantCount}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                job.status === 'Active'    ? 'bg-green-100 text-green-700'  :
                                job.status === 'Paused'    ? 'bg-amber-100 text-amber-700'  :
                                job.status === 'Completed' ? 'bg-blue-100 text-blue-700'    :
                                                             'bg-red-100 text-red-700'
                              }`}>{job.status}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button onClick={() => setSelectedJob(job)}
                                  className="p-1.5 rounded-lg border hover:bg-slate-50 text-slate-600 transition-all">
                                  <Eye size={14} />
                                </button>
                                <button onClick={() => handleDeleteJob(job._id)}
                                  className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 text-red-500 transition-all">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {jobTotal > 15 && (
                  <div className="px-4 pb-4">
                    <Pagination page={jobPage} pages={jobPages} total={jobTotal}
                      onPrev={() => { setJobPage(p => p - 1); fetchJobs(jobPage - 1); }}
                      onNext={() => { setJobPage(p => p + 1); fetchJobs(jobPage + 1); }} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ ANALYTICS ═══ */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-extrabold text-slate-900">Analytics</h1>

              {/* Summary cards from dashboard */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="Total Users"       value={dashStats?.stats?.totalUsers || 0}         icon={Users}      color="bg-indigo-500"  loading={loadingDash} />
                <MetricCard label="Active Jobs"        value={dashStats?.stats?.activeJobs || 0}         icon={Briefcase}  color="bg-green-500"   loading={loadingDash} />
                <MetricCard label="Applications"       value={dashStats?.stats?.totalApplications || 0} icon={CheckCircle}color="bg-blue-500"    loading={loadingDash} />
                <MetricCard label="Pending KYC"        value={dashStats?.stats?.pendingKyc || 0}         icon={Shield}     color="bg-amber-500"   loading={loadingDash} />
              </div>

              {/* Breakdown cards */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <h3 className="font-bold text-slate-800 mb-4">User Breakdown</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Workers (Volunteers)', count: dashStats?.stats?.totalWorkers || 0,    color: 'bg-indigo-500', pct: dashStats?.stats?.totalUsers ? Math.round((dashStats.stats.totalWorkers / dashStats.stats.totalUsers) * 100) : 0 },
                      { label: 'Organisers',           count: dashStats?.stats?.totalOrganizers || 0, color: 'bg-purple-500', pct: dashStats?.stats?.totalUsers ? Math.round((dashStats.stats.totalOrganizers / dashStats.stats.totalUsers) * 100) : 0 },
                    ].map(({ label, count, color, pct }) => (
                      <div key={label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-slate-700">{label}</span>
                          <span className="font-bold text-slate-900">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-2.5 rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <h3 className="font-bold text-slate-800 mb-4">KYC Status Breakdown</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Verified',    count: 0, color: 'bg-green-500' },
                      { label: 'Pending',     count: dashStats?.stats?.pendingKyc || 0, color: 'bg-amber-500' },
                      { label: 'In Progress', count: 0, color: 'bg-blue-500'  },
                      { label: 'Rejected',    count: 0, color: 'bg-red-400'   },
                    ].map(({ label, count, color }) => (
                      <div key={label} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${color}`} />
                          <span className="text-sm font-medium text-slate-700">{label}</span>
                        </div>
                        <span className="font-bold text-slate-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <h3 className="font-bold text-slate-800 mb-4">Job Statistics</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Total Jobs',       count: dashStats?.stats?.totalJobs || 0,        color: 'bg-slate-500'  },
                      { label: 'Active Jobs',       count: dashStats?.stats?.activeJobs || 0,       color: 'bg-green-500'  },
                      { label: 'Total Applications',count: dashStats?.stats?.totalApplications || 0, color: 'bg-indigo-500' },
                    ].map(({ label, count, color }) => (
                      <div key={label} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${color}`} />
                          <span className="text-sm font-medium text-slate-700">{label}</span>
                        </div>
                        <span className="font-bold text-slate-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <h3 className="font-bold text-slate-800 mb-4">Platform Health</h3>
                  <div className="space-y-4">
                    {[
                      {
                        label: 'KYC Completion Rate',
                        value: dashStats?.stats?.totalUsers
                          ? `${Math.round(((dashStats.stats.totalUsers - dashStats.stats.pendingKyc) / dashStats.stats.totalUsers) * 100)}%`
                          : '—',
                        hint: 'Users who completed KYC'
                      },
                      {
                        label: 'Job Fill Rate',
                        value: dashStats?.stats?.totalJobs
                          ? `${Math.round((dashStats.stats.activeJobs / dashStats.stats.totalJobs) * 100)}%`
                          : '—',
                        hint: 'Active vs total jobs'
                      },
                      {
                        label: 'Avg Apps per Job',
                        value: dashStats?.stats?.totalJobs && dashStats?.stats?.totalApplications
                          ? (dashStats.stats.totalApplications / dashStats.stats.totalJobs).toFixed(1)
                          : '—',
                        hint: 'Applications per posting'
                      },
                    ].map(({ label, value, hint }) => (
                      <div key={label} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{label}</p>
                          <p className="text-xs text-slate-400">{hint}</p>
                        </div>
                        <span className="text-2xl font-bold text-indigo-600">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODALS */}
      {selectedKyc && (
        <KycDetailModal
          submission={selectedKyc}
          onClose={() => setSelectedKyc(null)}
          onReview={handleKycReview}
        />
      )}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onToggleStatus={handleToggleUserStatus}
        />
      )}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onDelete={handleDeleteJob}
          onStatusChange={handleJobStatusChange}
        />
      )}
    </div>
  );
};

export default AdminDashboard;