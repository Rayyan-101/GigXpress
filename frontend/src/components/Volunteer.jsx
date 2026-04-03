import React, { useState, useEffect, useCallback } from 'react';
import {
  Briefcase, Star, MapPin, Calendar, DollarSign, Award,
  TrendingUp, CheckCircle, Clock, Filter, Search, Eye,
  Heart, Bell, Menu, X, Target, Trophy, Zap, Download,
  LogOut, Loader, RefreshCw, AlertCircle, ChevronDown,
  Send, XCircle, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─── API ──────────────────────────────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiFetch = async (path, options = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include', // 🔥 THIS FIXES EVERYTHING
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return res.json();
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const LEVELS = [
  { key: 'beginner',     label: 'Beginner',    gigs: '0–5',   min: 0,  },
  { key: 'volunteer',    label: 'Volunteer',   gigs: '6–15',  min: 6,  },
  { key: 'regular',      label: 'Regular',     gigs: '16–30', min: 16, },
  { key: 'professional', label: 'Professional',gigs: '31–50', min: 31, },
  { key: 'expert',       label: 'Expert',      gigs: '51+',   min: 51, },
];

const BADGE_ICONS = {
  'Event Pro':        { icon: '🎪', color: 'bg-blue-100 text-blue-700'    },
  'Reliable Worker':  { icon: '⭐', color: 'bg-yellow-100 text-yellow-700' },
  'Top Rated':        { icon: '🏆', color: 'bg-purple-100 text-purple-700' },
  'Marketing Expert': { icon: '📢', color: 'bg-green-100 text-green-700'  },
  'Quick Learner':    { icon: '⚡', color: 'bg-orange-100 text-orange-700' },
  'Team Player':      { icon: '🤝', color: 'bg-indigo-100 text-indigo-700' },
};

const CATEGORIES = ['Music','Sports','Corporate','Wedding','Education','Food','Startup','NGO','Community','Tech','Other'];

// ─── KYC REQUIRED MODAL ───────────────────────────────────────────────────────
const KycRequiredModal = ({ kycStatus, onClose }) => {
  const navigate     = useNavigate();
  const isRejected   = kycStatus === 'rejected';
  const isInProgress = kycStatus === 'in_progress';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-8 text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${
          isRejected ? 'bg-red-100' : isInProgress ? 'bg-amber-100' : 'bg-indigo-100'
        }`}>
          {isRejected   && <XCircle className="text-red-600"    size={42} />}
          {isInProgress && <Clock   className="text-amber-600"  size={42} />}
          {!isRejected && !isInProgress && <Shield className="text-indigo-600" size={42} />}
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {isRejected   ? 'KYC Rejected'        :
           isInProgress ? 'KYC Under Review'    :
                          'KYC Required to Apply'}
        </h3>
        <p className="text-gray-500 text-sm mb-6">
          {isRejected
            ? 'Your KYC was rejected. Please re-submit with clearer, valid documents to start applying for gigs.'
            : isInProgress
            ? 'Your documents are under review (24–48 hrs). You can apply for gigs once verified.'
            : 'Complete KYC verification to apply for gigs and get hired by event organisers.'}
        </p>

        <div className="flex flex-col gap-3">
          {!isInProgress && (
            <button
              onClick={() => { onClose(); navigate('/kyc'); }}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2">
              <Shield size={18} /> {isRejected ? 'Re-submit KYC' : 'Complete KYC Now'}
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all">
            {isInProgress ? 'Back to Dashboard' : 'Maybe Later'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── KYC BANNER ───────────────────────────────────────────────────────────────
const KycBanner = ({ kycStatus, onNavigate }) => {
  if (kycStatus === 'verified') return null;

  const cfgs = {
    pending:     { bg: 'bg-amber-50 border-amber-200',  Icon: AlertCircle, iconCls: 'text-amber-600', text: 'Complete KYC verification to apply for gigs and get hired.',     btn: 'Complete KYC',  btnCls: 'bg-amber-600 hover:bg-amber-700' },
    in_progress: { bg: 'bg-blue-50 border-blue-200',    Icon: Clock,       iconCls: 'text-blue-600',  text: 'KYC documents are under review. Gig applications unlock once approved.', btn: null,            btnCls: '' },
    rejected:    { bg: 'bg-red-50 border-red-200',      Icon: XCircle,     iconCls: 'text-red-600',   text: 'KYC rejected. Re-submit your documents to apply for gigs.',       btn: 'Re-submit KYC', btnCls: 'bg-red-600 hover:bg-red-700' },
  };
  const cfg = cfgs[kycStatus];
  if (!cfg) return null;
  const { Icon } = cfg;

  return (
    <div className={`mb-6 border rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 ${cfg.bg}`}>
      <Icon className={`flex-shrink-0 ${cfg.iconCls}`} size={20} />
      <p className="text-sm text-gray-700 flex-1 font-medium">{cfg.text}</p>
      {cfg.btn && (
        <button
          onClick={onNavigate}
          className={`flex-shrink-0 px-4 py-2 ${cfg.btnCls} text-white rounded-lg text-sm font-bold transition-all`}>
          {cfg.btn}
        </button>
      )}
    </div>
  );
};

// ─── APPLY MODAL ──────────────────────────────────────────────────────────────
const ApplyModal = ({ job, onClose, onSuccess, onKycBlock }) => {
  const [coverNote, setCoverNote] = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  const handleApply = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch(`/api/applications/${job._id}`, {
        method: 'POST',
        body: JSON.stringify({ coverNote }),
      });
      if (data.success) {
        onSuccess(job._id);
        onClose();
      } else if (data.kycRequired) {
        onClose();
        onKycBlock(data.kycStatus);
      } else {
        setError(data.message || 'Failed to apply. Please try again.');
      }
    } catch {
      setError('Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
        <div className="p-6 border-b flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Apply for Gig</h3>
            <p className="text-sm text-gray-500 mt-0.5">{job.title}</p>
          </div>
          <button onClick={onClose} disabled={loading} className="p-1 text-gray-400 hover:text-gray-700 rounded-full">
            <X size={22} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-indigo-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin size={14} className="text-indigo-500" />
              <span>{job.location?.city}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar size={14} className="text-indigo-500" />
              <span>{new Date(job.date).toLocaleDateString('en-IN')} • {job.time}</span>
            </div>
            <div className="flex items-center gap-2 font-semibold text-indigo-700">
              <DollarSign size={14} />
              <span>₹{job.pay?.amount?.toLocaleString('en-IN')} {job.pay?.type === 'per_day' ? '/day' : job.pay?.type === 'per_hour' ? '/hr' : 'fixed'}</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cover Note <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              value={coverNote}
              onChange={e => setCoverNote(e.target.value)}
              disabled={loading}
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
              placeholder="Tell the organiser why you're a great fit for this gig..."
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{coverNote.length}/500</p>
          </div>
        </div>

        <div className="p-6 border-t flex gap-3 justify-end">
          <button onClick={onClose} disabled={loading}
            className="px-5 py-2.5 border border-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button onClick={handleApply} disabled={loading}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-60">
            {loading ? <><Loader size={16} className="animate-spin" /> Applying...</> : <><Send size={16} /> Submit Application</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── JOB DETAIL MODAL ─────────────────────────────────────────────────────────
const JobDetailModal = ({ job, onClose, onApply, appliedJobIds, kycStatus }) => {
  const alreadyApplied = appliedJobIds.has(job._id);
  const slotsLeft      = job.slotsTotal - job.slotsFilled;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b sticky top-0 bg-white/95 backdrop-blur z-10 flex justify-between items-center">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
            {job.urgent && (
              <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-bold animate-pulse">Urgent</span>
            )}
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 rounded-full flex-shrink-0">
            <X size={22} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <img src={`https://i.pravatar.cc/150?u=${job.organizerId?._id}`} className="w-10 h-10 rounded-full" alt="Organiser" />
            <div>
              <p className="font-semibold text-gray-900">{job.organizerId?.fullName || 'Organiser'}</p>
              <p className="text-xs text-gray-500">Event Organiser • Verified</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: MapPin,     label: 'Location',   value: `${job.location?.city}${job.location?.address ? ' — ' + job.location.address : ''}` },
              { icon: Calendar,  label: 'Date & Time', value: `${new Date(job.date).toLocaleDateString('en-IN')} at ${job.time}` },
              { icon: Clock,     label: 'Duration',    value: job.duration },
              { icon: DollarSign,label: 'Pay',         value: `₹${job.pay?.amount?.toLocaleString('en-IN')} ${job.pay?.type === 'per_day' ? 'per day' : job.pay?.type === 'per_hour' ? 'per hour' : 'fixed'}` },
              { icon: Briefcase, label: 'Slots',       value: `${slotsLeft} of ${job.slotsTotal} remaining` },
              { icon: Award,     label: 'Category',    value: job.category },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <Icon size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 font-medium">{label}</p>
                  <p className="text-sm font-semibold text-gray-800">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {job.requiredSkills?.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Required Skills</p>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map(s => (
                  <span key={s} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}

          {job.description && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">About this Gig</p>
              <p className="text-sm text-gray-600 leading-relaxed">{job.description}</p>
            </div>
          )}

          {job.requirements && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Special Requirements</p>
              <p className="text-sm text-gray-600 leading-relaxed">{job.requirements}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t">
          {alreadyApplied ? (
            <div className="flex items-center gap-2 justify-center text-green-700 font-semibold">
              <CheckCircle size={20} /> <span>You have already applied for this gig</span>
            </div>
          ) : slotsLeft <= 0 ? (
            <div className="text-center text-gray-500 font-semibold">All slots filled</div>
          ) : (
            <button
              onClick={() => { onClose(); onApply(job); }}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2">
              <Send size={18} /> Apply Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN VOLUNTEER DASHBOARD ─────────────────────────────────────────────────
const WorkerDashboard = () => {
  const navigate = useNavigate();

  const [activeTab,   setActiveTab]   = useState('browse');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data
  const [dashboardData,  setDashboardData]  = useState(null);
  const [availableJobs,  setAvailableJobs]  = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [appliedJobIds,  setAppliedJobIds]  = useState(new Set());
  const [kycStatus,      setKycStatus]      = useState('pending');

  // UI state
  const [loadingDash,   setLoadingDash]   = useState(true);
  const [loadingJobs,   setLoadingJobs]   = useState(true);
  const [loadingApps,   setLoadingApps]   = useState(false);
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [applyingJob,   setApplyingJob]   = useState(null);
  const [previewJob,    setPreviewJob]    = useState(null);
  const [showKycModal,  setShowKycModal]  = useState(false);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [filterCat,     setFilterCat]     = useState('');
  const [errorMsg,      setErrorMsg]      = useState('');

  const userName  = localStorage.getItem('userName')  || 'Volunteer';
  const userEmail = localStorage.getItem('userEmail') || '';

  const handleLogout = () => {
    ['token','userRole','userId','userName','userEmail','kycStatus'].forEach(k => localStorage.removeItem(k));
    navigate('/login');
  };

  // Fetch dashboard + KYC status together
  const fetchDashboard = useCallback(async () => {
    setLoadingDash(true);
    const [dashRes, kycRes] = await Promise.all([
      apiFetch('/api/workers/dashboard'),
      apiFetch('/api/kyc/my'),
    ]);
    if (dashRes.success) setDashboardData(dashRes.data);
    else setErrorMsg(dashRes.message || 'Failed to load dashboard.');
    if (kycRes.success) {
      setKycStatus(kycRes.data.kycStatus);
    }
    setLoadingDash(false);
  }, []);

  const fetchJobs = useCallback(async (search = '', category = '') => {
    setLoadingJobs(true);
    let url = '/api/jobs?limit=50';
    if (search)   url += `&search=${encodeURIComponent(search)}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;
    const data = await apiFetch(url);
    if (data.success) setAvailableJobs(data.data.jobs);
    else setErrorMsg(data.message || 'Failed to load jobs.');
    setLoadingJobs(false);
  }, []);

  const fetchMyApplications = useCallback(async () => {
    setLoadingApps(true);
    const data = await apiFetch('/api/applications/my');
    
    if (data.success) {
      console.log("APPLICATIONS:", data.data.applications);
      setMyApplications(data.data.applications);
      const ids = new Set(
        data.data.applications
          .filter(a => a.status !== 'Withdrawn')
          .map(a => a.jobId?._id)
          .filter(Boolean)
      );
      setAppliedJobIds(ids);
    }
    setLoadingApps(false);
  }, []);

  useEffect(() => { fetchDashboard(); fetchJobs(); fetchMyApplications(); }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchJobs(searchQuery, filterCat), 400);
    return () => clearTimeout(t);
  }, [searchQuery, filterCat]);

  useEffect(() => {
    if (activeTab === 'applications') fetchMyApplications();
  }, [activeTab]);

  // Called when Apply button is clicked — check KYC first
  const handleApplyClick = (job) => {
    if (kycStatus !== 'verified') { setShowKycModal(true); return; }
    setApplyingJob(job);
  };

  const handleApplySuccess = (jobId) => {
    setAppliedJobIds(prev => new Set([...prev, jobId]));
    fetchMyApplications();
    fetchDashboard();
  };

  // Called when backend returns kycRequired: true from inside ApplyModal
  const handleKycBlock = (backendKycStatus) => {
    if (backendKycStatus) setKycStatus(backendKycStatus);
    setShowKycModal(true);
  };

  const handleWithdraw = async (applicationId) => {
    if (!window.confirm('Withdraw this application?')) return;
    setWithdrawingId(applicationId);
    const data = await apiFetch(`/api/applications/${applicationId}/withdraw`, { method: 'PATCH' });
    if (data.success) { fetchMyApplications(); fetchDashboard(); }
    else alert(data.message || 'Failed to withdraw.');
    setWithdrawingId(null);
  };

  // Helpers
  const formatPay = (pay) => {
    if (!pay) return '—';
    return `₹${pay.amount?.toLocaleString('en-IN')}${pay.type==='per_day'?'/day':pay.type==='per_hour'?'/hr':' fixed'}`;
  };

  const statusStyle = (s) => ({
    Pending:   'bg-amber-100 text-amber-700',
    Accepted:  'bg-green-100 text-green-700',
    Rejected:  'bg-red-100 text-red-700',
    Withdrawn: 'bg-gray-100 text-gray-500',
    Completed: 'bg-blue-100 text-blue-700',
  }[s] || 'bg-gray-100 text-gray-600');

  // Level calc
  const currentLevelKey = dashboardData?.stats?.currentLevel || 'beginner';
  const completedCount  = dashboardData?.stats?.totalGigsCompleted || 0;
  const currentLevelObj = LEVELS.find(l => l.key === currentLevelKey) || LEVELS[0];
  const nextLevelObj    = LEVELS[LEVELS.indexOf(currentLevelObj) + 1];
  const progressPct     = nextLevelObj
    ? Math.min(100, Math.round(((completedCount - currentLevelObj.min) / (nextLevelObj.min - currentLevelObj.min)) * 100))
    : 100;
  const gigsToNext = nextLevelObj ? Math.max(0, nextLevelObj.min - completedCount) : 0;

  const statsCards = [
    { label: 'Total Earnings', value: `₹${(dashboardData?.stats?.totalEarnings||0).toLocaleString('en-IN')}`,           icon: DollarSign,  color: 'from-green-500 to-green-600'   },
    { label: 'Completed Gigs', value: String(dashboardData?.stats?.totalGigsCompleted||0),                               icon: CheckCircle, color: 'from-blue-500 to-blue-600'     },
    { label: 'Avg Rating',     value: dashboardData?.stats?.averageRating ? dashboardData.stats.averageRating.toFixed(1) : '—', icon: Star, color: 'from-yellow-500 to-yellow-600' },
    { label: 'Reliability',    value: `${dashboardData?.stats?.reliabilityScore||100}%`,                                 icon: Award,       color: 'from-purple-500 to-purple-600'  },
  ];

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* NAVBAR */}
      <nav className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-full">
                <Menu size={24} />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="text-white" size={20} />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">GigXpress</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* KYC pill */}
              {kycStatus === 'verified'
                ? <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200"><CheckCircle size={12}/> KYC Verified</span>
                : <button onClick={() => navigate('/kyc')}
                    className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                      kycStatus==='rejected'    ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' :
                      kycStatus==='in_progress' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                  'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                    }`}>
                    <Shield size={12}/>
                    {kycStatus==='rejected' ? 'KYC Rejected' : kycStatus==='in_progress' ? 'KYC Pending' : 'Complete KYC'}
                  </button>
              }

              <button className="relative p-2 hover:bg-gray-100 rounded-full">
                <Bell size={20} />
                {myApplications.some(a => a.status === 'Accepted') && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>

              {/* Profile avatar → /profile */}
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 pl-3 border-l hover:bg-gray-50 p-1 rounded-xl transition-colors">
                <img src={`https://i.pravatar.cc/150?u=${userEmail}`} alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-transparent hover:border-indigo-500 transition-all" />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold">{userName}</p>
                  <p className="text-xs text-gray-500 capitalize">{currentLevelObj.label}</p>
                </div>
              </button>

              <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* SIDEBAR */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none`}>
          <div className="p-5 space-y-5 pt-4">
            {/* Level card */}
            {loadingDash ? (
              <div className="bg-gray-100 rounded-xl h-24 animate-pulse" />
            ) : (
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy size={18} />
                  <span className="font-bold">{currentLevelObj.label}</span>
                </div>
                <p className="text-xs text-white/80 mb-2">
                  {nextLevelObj ? `${gigsToNext} more gig${gigsToNext !== 1 ? 's' : ''} to ${nextLevelObj.label}!` : 'Max level reached! 🎉'}
                </p>
                <div className="w-full bg-white/30 rounded-full h-1.5">
                  <div className="bg-white h-1.5 rounded-full transition-all duration-1000" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            )}

            <nav className="space-y-1">
              {[
                { id: 'browse',       label: 'Browse Gigs',     icon: Search      },
                { id: 'applications', label: 'My Applications', icon: Clock       },
                { id: 'scheduled',    label: 'Scheduled',       icon: Calendar    },
                { id: 'completed',    label: 'Completed',       icon: CheckCircle },
                { id: 'portfolio',    label: 'My Portfolio',    icon: Award       },
                { id: 'earnings',     label: 'Earnings',        icon: DollarSign  },
              ].map(item => (
                <button key={item.id}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                    activeTab === item.id ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}>
                  <item.icon size={20} />
                  {item.label}
                  {item.id === 'applications' && myApplications.filter(a => a.status === 'Accepted').length > 0 && (
                    <span className="ml-auto bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {myApplications.filter(a => a.status === 'Accepted').length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">

          {errorMsg && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 items-center">
              <AlertCircle className="text-red-500" size={18} />
              <p className="text-red-800 text-sm">{errorMsg}</p>
              <button onClick={() => setErrorMsg('')} className="ml-auto text-red-400 hover:text-red-600"><X size={16} /></button>
            </div>
          )}

          {/* KYC banner — all tabs */}
          <KycBanner kycStatus={kycStatus} onNavigate={() => navigate('/kyc')} />

          {/* ══ BROWSE GIGS ══ */}
          {activeTab === 'browse' && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Browse Available Gigs</h1>
                  <p className="text-gray-600 mt-1">Find opportunities that match your skills</p>
                </div>
                <button onClick={() => fetchJobs(searchQuery, filterCat)}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-semibold">
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>

              {/* Stats */}
              {loadingDash ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-xl h-28 border border-gray-100 animate-pulse" />)}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {statsCards.map((stat, i) => (
                    <div key={i} className="group bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-11 h-11 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center text-white shadow-md group-hover:rotate-6 transition-transform`}>
                          <stat.icon size={22} />
                        </div>
                      </div>
                      <p className="text-gray-500 text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-0.5">{stat.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Search + filter */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by title..."
                    className="pl-10 pr-4 py-3 border border-gray-200 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 outline-none bg-white shadow-sm"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <select
                    value={filterCat}
                    onChange={e => setFilterCat(e.target.value)}
                    className="pl-9 pr-8 py-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm appearance-none cursor-pointer min-w-[160px]">
                    <option value="">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Job cards */}
              {loadingJobs ? (
                <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-xl h-40 border border-gray-100 animate-pulse" />)}</div>
              ) : availableJobs.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
                  <Search size={48} className="mx-auto text-gray-300 mb-3" />
                  <h3 className="text-lg font-bold text-gray-700 mb-1">No gigs found</h3>
                  <p className="text-gray-500 text-sm">Try a different search or check back later.</p>
                </div>
              ) : (
                <div className="grid gap-5">
                  {availableJobs.map(job => {
                    const alreadyApplied = appliedJobIds.has(job._id);
                    const slotsLeft      = job.slotsTotal - job.slotsFilled;
                    return (
                      <div key={job._id}
                        className="group bg-white rounded-xl shadow-sm p-5 hover:shadow-xl transition-all duration-300 border-l-4 border-transparent hover:border-indigo-500 border border-gray-100 hover:-translate-y-0.5">
                        {job.urgent && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-bold mb-3 animate-pulse">
                            <Zap size={11} /> Urgent Hiring
                          </span>
                        )}

                        <div className="flex flex-col lg:flex-row justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                                  <span className="font-medium">{job.organizerId?.fullName || 'Organiser'}</span>
                                  <CheckCircle size={13} className="text-green-500" />
                                  <span className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-medium">{job.category}</span>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0 ml-3">
                                <p className="text-2xl font-bold text-indigo-600">{formatPay(job.pay)}</p>
                                <p className="text-xs text-gray-400">{slotsLeft} slot{slotsLeft !== 1 ? 's' : ''} left</p>
                              </div>
                            </div>

                            {job.requiredSkills?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-3">
                                {job.requiredSkills.map(s => (
                                  <span key={s} className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">{s}</span>
                                ))}
                              </div>
                            )}

                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-indigo-400" />{job.location?.city}</span>
                              <span className="flex items-center gap-1.5"><Calendar size={14} className="text-indigo-400" />{new Date(job.date).toLocaleDateString('en-IN')} • {job.time}</span>
                              <span className="flex items-center gap-1.5"><Clock size={14} className="text-indigo-400" />{job.duration}</span>
                              <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-indigo-400" />{job.slotsTotal} workers needed</span>
                            </div>
                          </div>

                          <div className="flex lg:flex-col gap-2 items-start">
                            {alreadyApplied ? (
                              <div className="flex items-center gap-1.5 px-4 py-2.5 bg-green-50 text-green-700 rounded-lg font-semibold text-sm border border-green-200">
                                <CheckCircle size={15} /> Applied
                              </div>
                            ) : (
                              <button
                                onClick={() => handleApplyClick(job)}
                                disabled={slotsLeft <= 0}
                                className="flex-1 lg:flex-initial px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:brightness-110 hover:shadow-lg transition-all active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                {slotsLeft <= 0 ? 'Full' : 'Apply Now'}
                              </button>
                            )}
                            <button onClick={() => setPreviewJob(job)}
                              className="px-3 py-2.5 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-all active:scale-90 text-sm flex items-center gap-1.5 font-medium">
                              <Eye size={15} /> View
                            </button>
                            <button className="px-3 py-2.5 border border-gray-200 rounded-lg hover:bg-pink-50 hover:text-pink-600 transition-all active:scale-90" title="Save">
                              <Heart size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══ MY APPLICATIONS ══ */}
          {activeTab === 'applications' && (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
                <button onClick={fetchMyApplications}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-semibold">
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>

              {loadingApps ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-xl h-28 border border-gray-100 animate-pulse" />)}</div>
              ) : myApplications.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
                  <Clock size={48} className="mx-auto text-gray-300 mb-3" />
                  <h3 className="text-lg font-bold text-gray-700 mb-1">No applications yet</h3>
                  <p className="text-gray-500 text-sm mb-5">Start browsing gigs and apply to get started</p>
                  <button onClick={() => setActiveTab('browse')}
                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all">
                    Browse Gigs
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {myApplications.map(app => {
                    const job = app.jobId;
                    return (
                      <div key={app._id} className="group bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:border-indigo-100 hover:shadow-md transition-all">
                        <div className="flex flex-col lg:flex-row justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{job?.title || 'Job'}</h3>
                                <p className="text-sm text-gray-500">{app.organizerId?.fullName}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ml-3 ${statusStyle(app.status)}`}>
                                {app.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-2">
                              {job?.date && <span className="flex items-center gap-1.5"><Calendar size={13} className="text-indigo-400" />{new Date(job.date).toLocaleDateString('en-IN')}</span>}
                              {job?.pay  && <span className="flex items-center gap-1.5 font-semibold text-gray-700"><DollarSign size={13} className="text-indigo-400" />{formatPay(job.pay)}</span>}
                              {job?.location && <span className="flex items-center gap-1.5"><MapPin size={13} className="text-indigo-400" />{job.location.city}</span>}
                              <span className="flex items-center gap-1.5 text-xs text-gray-400"><Clock size={12} />Applied {new Date(app.appliedAt).toLocaleDateString('en-IN')}</span>
                            </div>
                            {app.coverNote && (
                              <p className="text-xs text-gray-500 italic bg-gray-50 px-3 py-2 rounded-lg mt-1">"{app.coverNote}"</p>
                            )}
                          </div>

                          <div className="flex lg:flex-col gap-2 flex-shrink-0">
                            {app.status === 'Accepted' && (
                              <div className="flex items-center gap-1.5 px-3 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-semibold">
                                <CheckCircle size={14} /> Hired!
                              </div>
                            )}
                            {app.status === 'Pending' && (
                              <button
                                onClick={() => handleWithdraw(app._id)}
                                disabled={withdrawingId === app._id}
                                className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-60">
                                {withdrawingId === app._id ? <Loader size={13} className="animate-spin" /> : <XCircle size={13} />}
                                Withdraw
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══ SCHEDULED ══ */}
          {activeTab === 'scheduled' && (
            <div className="space-y-5">
              <h1 className="text-3xl font-bold text-gray-900">Upcoming Schedule</h1>
              {(() => {
                const scheduled = myApplications.filter(a => a.status === 'Accepted');
                if (loadingApps) return <div className="bg-white rounded-xl h-48 border border-gray-100 animate-pulse" />;
                if (scheduled.length === 0) return (
                  <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-200 p-14 text-center">
                    <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
                    <h3 className="text-lg font-bold text-gray-700 mb-1">No upcoming gigs</h3>
                    <p className="text-gray-500 text-sm mb-5">Apply to gigs and get accepted to see them here</p>
                    <button onClick={() => setActiveTab('browse')}
                      className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:opacity-90 transition-all">
                      Explore Gigs
                    </button>
                  </div>
                );
                return (
                  <div className="grid gap-4">
                    {scheduled.map(app => {
                      const job = app.jobId;
                      return (
                        <div key={app._id} className="bg-white rounded-xl shadow-sm border-l-4 border-green-500 border border-gray-100 p-5">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg">{job?.title}</h3>
                              <p className="text-sm text-gray-500">{app.organizerId?.fullName}</p>
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Confirmed</span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            {job?.date && <span className="flex items-center gap-1.5"><Calendar size={14} className="text-green-500" />{new Date(job.date).toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</span>}
                            {job?.time && <span className="flex items-center gap-1.5"><Clock size={14} className="text-green-500" />{job.time}</span>}
                            {job?.location && <span className="flex items-center gap-1.5"><MapPin size={14} className="text-green-500" />{job.location.city}{job.location.address ? ` — ${job.location.address}` : ''}</span>}
                            {job?.pay && <span className="flex items-center gap-1.5 font-semibold text-green-700"><DollarSign size={14} />{formatPay(job.pay)}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ══ COMPLETED ══ */}
          {activeTab === 'completed' && (
            <div className="space-y-5">
              <h1 className="text-3xl font-bold text-gray-900">Completed Gigs</h1>
              {loadingDash ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-xl h-32 border border-gray-100 animate-pulse" />)}</div>
              ) : (dashboardData?.completedGigs || []).length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-14 text-center">
                  <CheckCircle size={48} className="mx-auto text-gray-300 mb-3" />
                  <h3 className="text-lg font-bold text-gray-700 mb-1">No completed gigs yet</h3>
                  <p className="text-gray-500 text-sm">Complete your first gig to see it here with your rating</p>
                </div>
              ) : (
                <div className="grid gap-5">
                  {(dashboardData?.completedGigs || []).map(app => {
                    const job = app.jobId;
                    return (
                      <div key={app._id} className="group bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500 border border-gray-100 hover:shadow-lg transition-all">
                        <div className="flex flex-col lg:flex-row gap-5">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">{job?.title}</h3>
                                <p className="text-gray-500 text-sm">{app.organizerId?.fullName}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-green-600">{formatPay(job?.pay)}</p>
                                <p className="text-xs text-gray-400">Earned</p>
                              </div>
                            </div>
                            {app.rating?.score && (
                              <>
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} size={16} className={i < Math.floor(app.rating.score) ? 'text-yellow-500 fill-current' : 'text-gray-300'} />
                                    ))}
                                  </div>
                                  <span className="text-sm font-semibold text-gray-700">{app.rating.score}/5</span>
                                </div>
                                {app.rating.review && (
                                  <div className="bg-gray-50 rounded-lg p-3 group-hover:bg-green-50 transition-colors border border-transparent group-hover:border-green-100">
                                    <p className="text-sm text-gray-600 italic">"{app.rating.review}"</p>
                                  </div>
                                )}
                              </>
                            )}
                            {job?.date && <p className="text-xs text-gray-400 mt-2">Completed on {new Date(job.date).toLocaleDateString('en-IN')}</p>}
                          </div>
                          <div>
                            <button className="px-5 py-2 border border-indigo-600 text-indigo-600 rounded-lg font-semibold text-sm hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2">
                              <Download size={15} /> Certificate
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══ PORTFOLIO ══ */}
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Digital Portfolio</h1>
                <p className="text-gray-600 mt-1">Showcase your achievements and skills</p>
              </div>

              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white shadow-xl">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <img src={`https://i.pravatar.cc/150?u=${userEmail}`} alt="Profile"
                    className="w-28 h-28 rounded-full border-4 border-white shadow-lg" />
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-bold mb-1">{userName}</h2>
                    <p className="text-white/80 mb-4 capitalize">
                      {currentLevelObj.label} • {dashboardData?.profile?.location?.city || 'Location not set'}
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                      {[
                        { label: 'Completed Gigs', value: dashboardData?.stats?.totalGigsCompleted || 0 },
                        { label: 'Avg Rating',     value: dashboardData?.stats?.averageRating ? dashboardData.stats.averageRating.toFixed(1) : '—' },
                        { label: 'Total Earned',   value: `₹${(dashboardData?.stats?.totalEarnings||0).toLocaleString('en-IN')}` },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm hover:bg-white/20 transition-colors">
                          <p className="text-2xl font-bold">{value}</p>
                          <p className="text-xs text-white/70 uppercase">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {dashboardData?.profile?.skills?.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">My Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {dashboardData.profile.skills.map(s => (
                      <span key={s} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-bold text-gray-900">Skill Badges</h3>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                    {dashboardData?.stats?.badges?.length || 0} Earned
                  </span>
                </div>
                {(dashboardData?.stats?.badges || []).length === 0 ? (
                  <div className="text-center py-8">
                    <Award size={40} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500 text-sm">Complete gigs to earn badges</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {dashboardData.stats.badges.map((badge, i) => {
                      const style = BADGE_ICONS[badge.name] || { icon: '🏅', color: 'bg-gray-100 text-gray-700' };
                      return (
                        <div key={i} className={`${style.color} rounded-xl p-5 text-center hover:scale-105 transition-all cursor-pointer`}>
                          <div className="text-4xl mb-2">{style.icon}</div>
                          <h4 className="font-bold">{badge.name}</h4>
                          {badge.awardedAt && <p className="text-xs opacity-70 mt-1">{new Date(badge.awardedAt).toLocaleDateString('en-IN')}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-5">Career Progression</h3>
                <div className="space-y-3">
                  {LEVELS.map((level, i) => {
                    const isCurrent = level.key === currentLevelKey;
                    const isPast    = LEVELS.indexOf(level) < LEVELS.indexOf(currentLevelObj);
                    return (
                      <div key={level.key} className={`flex items-center gap-4 p-3 rounded-xl transition-all ${isCurrent ? 'bg-indigo-50 shadow-sm' : 'hover:bg-gray-50'}`}>
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-white transition-all ${isCurrent ? 'bg-gradient-to-r from-indigo-600 to-purple-600 scale-110 shadow-lg' : isPast ? 'bg-green-500' : 'bg-gray-200'}`}>
                          {isPast ? <CheckCircle size={18} /> : i + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-0.5">
                            <h4 className={`font-bold ${isCurrent ? 'text-indigo-600' : isPast ? 'text-green-600' : 'text-gray-500'}`}>{level.label}</h4>
                            <span className="text-sm text-gray-400">{level.gigs} gigs</span>
                          </div>
                          {isCurrent && nextLevelObj && (
                            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${progressPct}%` }} />
                            </div>
                          )}
                        </div>
                        {isCurrent && <Target className="text-indigo-600 animate-pulse" size={22} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ══ EARNINGS ══ */}
          {activeTab === 'earnings' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">Earnings & Payments</h1>

              <div className="grid sm:grid-cols-3 gap-5">
                {[
                  { label: 'Total Earnings', val: `₹${(dashboardData?.stats?.totalEarnings||0).toLocaleString('en-IN')}`,        icon: DollarSign,  color: 'from-green-500 to-green-600'   },
                  { label: 'This Month',      val: `₹${(dashboardData?.stats?.currentMonthEarnings||0).toLocaleString('en-IN')}`, icon: TrendingUp,  color: 'from-indigo-500 to-purple-600' },
                  { label: 'Gigs Completed',  val: String(dashboardData?.stats?.totalGigsCompleted||0),                           icon: CheckCircle, color: 'from-blue-500 to-blue-600'     },
                ].map((item, i) => (
                  <div key={i} className="group bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-lg transition-all hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-11 h-11 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center text-white group-hover:rotate-6 transition-transform`}>
                        <item.icon size={22} />
                      </div>
                      <h3 className="font-semibold text-gray-600 text-sm">{item.label}</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{item.val}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-xl font-bold text-gray-900">Payment History</h3>
                  <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm font-medium transition-all">
                    <Download size={15} /> Export
                  </button>
                </div>

                {(dashboardData?.completedGigs || []).length === 0 ? (
                  <div className="text-center py-10">
                    <DollarSign size={40} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500 text-sm">No payments yet — complete gigs to earn</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(dashboardData?.completedGigs || []).map(app => (
                      <div key={app._id} className="group flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-green-200 hover:bg-green-50/30 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform">
                            <CheckCircle className="text-green-600" size={20} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{app.jobId?.title}</p>
                            <p className="text-xs text-gray-400">{app.jobId?.date ? new Date(app.jobId.date).toLocaleDateString('en-IN') : ''}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{formatPay(app.jobId?.pay)}</p>
                          <p className="text-xs text-green-600 font-medium">Paid</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODALS */}
      {applyingJob && (
        <ApplyModal
          job={applyingJob}
          onClose={() => setApplyingJob(null)}
          onSuccess={handleApplySuccess}
          onKycBlock={handleKycBlock}
        />
      )}
      {previewJob && (
        <JobDetailModal
          job={previewJob}
          onClose={() => setPreviewJob(null)}
          onApply={handleApplyClick}
          appliedJobIds={appliedJobIds}
          kycStatus={kycStatus}
        />
      )}
      {showKycModal && (
        <KycRequiredModal kycStatus={kycStatus} onClose={() => setShowKycModal(false)} />
      )}
    </div>
  );
};

export default WorkerDashboard;