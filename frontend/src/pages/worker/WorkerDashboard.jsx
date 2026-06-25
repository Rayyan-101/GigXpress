import React, { useState, useEffect, useCallback } from 'react';
import {
  Briefcase, Star, MapPin, Calendar, MessageSquare, DollarSign, Award,
  TrendingUp, CheckCircle, Clock, Filter, Search, Eye,
  Heart, Menu, X, Target, Trophy, Zap, Download,Users,
  LogOut, Loader, RefreshCw, AlertCircle, ChevronDown,
  Send, XCircle, Shield, Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChatWindow from '../../components/ChatWindow';
import NotificationBell from '../../components/NotificationBell';
import { StarDisplay, StarRatingInput } from '../../components/common/StarRating';
import { EVENT_CATEGORIES as CATEGORIES } from '../../constants/events';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const isJobCompleted = (job) => {
  if (job?.status === 'Completed') return true;
  if (!job?.date) return false;

  const eventDate = new Date(job.date);
  const today = new Date();
  eventDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return eventDate < today;
};

const paySuffix = (type) => {
  if (type === 'per_day') return '/day';
  if (type === 'per_hour' || type === 'hourly') return '/hr';
  return '';
};

const payLabel = (type) => {
  if (type === 'per_day') return 'per day';
  if (type === 'per_hour' || type === 'hourly') return 'per hour';
  return 'fixed';
};

const apiFetch = async (path, options = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  return res.json();
};

const LEVELS = [
  { key: 'beginner',     label: 'Beginner',     gigs: '0–5',   min: 0  },
  { key: 'volunteer',    label: 'Volunteer',    gigs: '6–15',  min: 6  },
  { key: 'regular',      label: 'Regular',      gigs: '16–30', min: 16 },
  { key: 'professional', label: 'Professional', gigs: '31–50', min: 31 },
  { key: 'expert',       label: 'Expert',       gigs: '51+',   min: 51 },
];

const BADGE_ICONS = {
  'Event Pro':        { icon: '🎪', color: 'bg-blue-50 text-blue-700 border border-blue-100'    },
  'Reliable Worker':  { icon: '⭐', color: 'bg-amber-50 text-amber-700 border border-amber-100' },
  'Top Rated':        { icon: '🏆', color: 'bg-purple-50 text-purple-700 border border-purple-100' },
  'Marketing Expert': { icon: '📢', color: 'bg-green-50 text-green-700 border border-green-100'  },
  'Quick Learner':    { icon: '⚡', color: 'bg-orange-50 text-orange-700 border border-orange-100' },
  'Team Player':      { icon: '🤝', color: 'bg-indigo-50 text-indigo-700 border border-indigo-100' },
};

// ─── STATUS HELPERS ───────────────────────────────────────────────────────────
const statusConfig = {
  Pending:   { cls: 'bg-amber-50 text-amber-700 border border-amber-100',  dot: 'bg-amber-400' },
  Accepted:  { cls: 'bg-emerald-50 text-emerald-700 border border-emerald-100', dot: 'bg-emerald-400' },
  Rejected:  { cls: 'bg-red-50 text-red-700 border border-red-100',        dot: 'bg-red-400'   },
  Withdrawn: { cls: 'bg-slate-100 text-slate-500 border border-slate-200', dot: 'bg-slate-300' },
  Completed: { cls: 'bg-blue-50 text-blue-700 border border-blue-100',     dot: 'bg-blue-400'  },
};
const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || { cls: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
};

// ─── RATE ORGANIZER MODAL ─────────────────────────────────────────────────────
const RateOrganizerModal = ({ application, onClose, onSuccess }) => {
  const [score, setScore]   = useState(5);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const organizer = application.organizerId;
  const job       = application.jobId;

  const handleSubmit = async () => {
    setLoading(true); setError('');
    const data = await apiFetch(`/api/applications/${application._id}/rate-organizer`, {
      method: 'PATCH', body: JSON.stringify({ score, review }),
    });
    setLoading(false);
    if (data.success) { onSuccess(); onClose(); }
    else setError(data.message || 'Failed to submit rating.');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Rate the Organiser</h3>
            <p className="text-sm text-slate-500 mt-0.5">How was your experience?</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"><X size={20}/></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center gap-3">
            <img src={`https://i.pravatar.cc/150?u=${organizer?._id}`} alt={organizer?.fullName} className="w-10 h-10 rounded-full object-cover ring-2 ring-white"/>
            <div>
              <p className="font-semibold text-slate-900 text-sm">{organizer?.fullName}</p>
              <p className="text-xs text-indigo-600 font-medium">{job?.title}</p>
              {job?.date && <p className="text-xs text-slate-400 mt-0.5">Completed {new Date(job.date).toLocaleDateString('en-IN')}</p>}
            </div>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex gap-2">
              <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5"/>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2.5">Your Rating</label>
            <StarRatingInput value={score} onChange={setScore}/>
            <p className="text-xs text-slate-400 mt-1.5">{['','Poor','Below Average','Average','Good','Excellent'][score]} ({score}/5)</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Review <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea value={review} onChange={e => setReview(e.target.value)} rows={3} maxLength={300}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none text-sm resize-none bg-slate-50 focus:bg-white transition-colors"
              placeholder="Was the event well-organised? Clear communication?"/>
            <p className="text-xs text-slate-400 mt-1 text-right">{review.length}/300</p>
          </div>
        </div>
        <div className="p-5 border-t border-slate-100 flex gap-3 justify-end">
          <button onClick={onClose} disabled={loading} className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors text-slate-700">Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-60">
            {loading ? <><Loader size={15} className="animate-spin"/>Submitting...</> : <><Star size={15}/>Submit Rating</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── KYC REQUIRED MODAL ───────────────────────────────────────────────────────
const KycRequiredModal = ({ kycStatus, onClose }) => {
  const navigate = useNavigate();
  const isRejected = kycStatus === 'rejected';
  const isInProgress = kycStatus === 'in_progress';
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-7 text-center border border-slate-100">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isRejected?'bg-red-50':isInProgress?'bg-amber-50':'bg-indigo-50'}`}>
          {isRejected?<XCircle className="text-red-500" size={32}/>:isInProgress?<Clock className="text-amber-500" size={32}/>:<Shield className="text-indigo-600" size={32}/>}
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1.5">{isRejected?'KYC Rejected':isInProgress?'KYC Under Review':'KYC Required'}</h3>
        <p className="text-slate-500 text-sm mb-5 leading-relaxed">{isRejected?'Re-submit with clearer documents to start applying.':isInProgress?'Under review (24–48 hrs). You can apply once verified.':'Complete KYC verification to apply for gigs.'}</p>
        <div className="space-y-2.5">
          {!isInProgress&&<button onClick={() => { onClose(); navigate('/kyc'); }} className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"><Shield size={16}/>{isRejected?'Re-submit KYC':'Complete KYC Now'}</button>}
          <button onClick={onClose} className="w-full py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors">{isInProgress?'Back to Dashboard':'Maybe Later'}</button>
        </div>
      </div>
    </div>
  );
};

// ─── KYC BANNER ───────────────────────────────────────────────────────────────
const KycBanner = ({ kycStatus, onNavigate }) => {
  if (kycStatus === 'verified') return null;
  const cfgs = {
    pending:     { bg:'bg-amber-50 border-amber-200', Icon:AlertCircle, ic:'text-amber-500', text:'Complete KYC verification to apply for gigs.',     btn:'Complete KYC',  bc:'bg-amber-500 hover:bg-amber-600 text-white' },
    in_progress: { bg:'bg-blue-50 border-blue-200',   Icon:Clock,       ic:'text-blue-500',  text:'KYC documents are under review (24–48 hrs).',      btn:null, bc:'' },
    rejected:    { bg:'bg-red-50 border-red-200',     Icon:XCircle,     ic:'text-red-500',   text:'KYC rejected. Please re-submit your documents.',   btn:'Re-submit KYC', bc:'bg-red-500 hover:bg-red-600 text-white' },
  };
  const cfg = cfgs[kycStatus]; if (!cfg) return null;
  const { Icon } = cfg;
  return (
    <div className={`mb-5 border rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center gap-3 ${cfg.bg}`}>
      <Icon className={`shrink-0 ${cfg.ic}`} size={18}/>
      <p className="text-sm text-slate-700 flex-1 font-medium">{cfg.text}</p>
      {cfg.btn && <button onClick={onNavigate} className={`shrink-0 px-4 py-1.5 ${cfg.bc} rounded-lg text-sm font-bold transition-colors`}>{cfg.btn}</button>}
    </div>
  );
};

// ─── APPLY MODAL ──────────────────────────────────────────────────────────────
const ApplyModal = ({ job, onClose, onSuccess, onKycBlock }) => {
  const [coverNote, setCoverNote] = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const handleApply = async () => {
    setLoading(true); setError('');
    try {
      const data = await apiFetch(`/api/applications/${job._id}`, { method: 'POST', body: JSON.stringify({ coverNote }) });
      if (data.success) { onSuccess(job._id); onClose(); }
      else if (data.kycRequired) { onClose(); onKycBlock(data.kycStatus); }
      else setError(data.message || 'Failed to apply.');
    } catch { setError('Unable to connect to server.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100">
        <div className="p-5 border-b border-slate-100 flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Apply for Gig</h3>
            <p className="text-sm text-slate-500 mt-0.5 font-medium">{job.title}</p>
          </div>
          <button onClick={onClose} disabled={loading} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"><X size={20}/></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 grid grid-cols-3 gap-3 text-sm">
            <div><p className="text-xs text-slate-400 mb-0.5">Location</p><p className="font-semibold text-slate-700 flex items-center gap-1"><MapPin size={12} className="text-indigo-400"/>{job.location?.city}</p></div>
            <div><p className="text-xs text-slate-400 mb-0.5">Date</p><p className="font-semibold text-slate-700">{new Date(job.date).toLocaleDateString('en-IN')}</p></div>
            <div><p className="text-xs text-slate-400 mb-0.5">Pay</p><p className="font-bold text-indigo-600">₹{job.pay?.amount?.toLocaleString('en-IN')}{paySuffix(job.pay?.type)}</p></div>
          </div>
          {error && <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex gap-2"><AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5"/><p className="text-sm text-red-700">{error}</p></div>}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Cover Note <span className="font-normal text-slate-400">(optional)</span></label>
            <textarea value={coverNote} onChange={e => setCoverNote(e.target.value)} disabled={loading} rows={4} maxLength={500}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none text-sm resize-none bg-slate-50 focus:bg-white transition-colors"
              placeholder="Tell the organiser why you're a great fit..."/>
            <p className="text-xs text-slate-400 mt-1 text-right">{coverNote.length}/500</p>
          </div>
        </div>
        <div className="p-5 border-t border-slate-100 flex gap-3 justify-end">
          <button onClick={onClose} disabled={loading} className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors text-slate-700">Cancel</button>
          <button onClick={handleApply} disabled={loading}
            className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-60">
            {loading?<><Loader size={15} className="animate-spin"/>Applying...</>:<><Send size={15}/>Submit Application</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── JOB DETAIL MODAL ─────────────────────────────────────────────────────────
const JobDetailModal = ({ job, onClose, onApply, appliedJobIds, kycStatus }) => {
  const alreadyApplied = appliedJobIds.has(job._id);
  const slotsLeft = job.slotsTotal - job.slotsFilled;
  const isCompleted = isJobCompleted(job);
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100">
        <div className="p-5 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur z-10 flex justify-between items-center">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
            {job.urgent && <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-full text-xs font-bold">⚡ Urgent</span>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 shrink-0 transition-colors"><X size={20}/></button>
        </div>
        <div className="p-5 space-y-5">
          <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <img src={`https://i.pravatar.cc/150?u=${job.organizerId?._id}`} className="w-10 h-10 rounded-full ring-2 ring-white shadow-sm" alt="Organiser"/>
            <div>
              <p className="font-semibold text-slate-900 text-sm">{job.organizerId?.fullName || 'Organiser'}</p>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><CheckCircle size={11} className="text-emerald-500"/>Verified Organiser</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {[
              { icon:MapPin,    label:'Location',    value:`${job.location?.city}${job.location?.address?' — '+job.location.address:''}` },
              { icon:Calendar,  label:'Date & Time', value:`${new Date(job.date).toLocaleDateString('en-IN')} at ${job.time}` },
              { icon:Clock,     label:'Duration',    value:job.duration },
              { icon:DollarSign,label:'Pay',         value:`₹${job.pay?.amount?.toLocaleString('en-IN')} ${payLabel(job.pay?.type)}` },
              { icon:Briefcase, label:'Slots Left',  value:`${slotsLeft} of ${job.slotsTotal} remaining` },
              { icon:Award,     label:'Category',    value:job.category },
            ].map(({ icon:Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Icon size={15} className="text-indigo-500 mt-0.5 shrink-0"/>
                <div><p className="text-xs text-slate-400 font-medium">{label}</p><p className="text-sm font-semibold text-slate-800 mt-0.5">{value}</p></div>
              </div>
            ))}
          </div>
          {job.requiredSkills?.length>0&&<div><p className="text-sm font-semibold text-slate-700 mb-2">Required Skills</p><div className="flex flex-wrap gap-1.5">{job.requiredSkills.map(s=><span key={s} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-xs font-semibold">{s}</span>)}</div></div>}
          {job.description&&<div><p className="text-sm font-semibold text-slate-700 mb-1.5">About this Gig</p><p className="text-sm text-slate-600 leading-relaxed">{job.description}</p></div>}
          {job.requirements&&<div><p className="text-sm font-semibold text-slate-700 mb-1.5">Special Requirements</p><p className="text-sm text-slate-600 leading-relaxed">{job.requirements}</p></div>}
        </div>
        <div className="p-5 border-t border-slate-100">
          {isCompleted ? <div className="text-center text-blue-600 font-semibold py-1">This event is completed</div>
          : alreadyApplied ? <div className="flex items-center gap-2 justify-center text-emerald-700 font-semibold py-1"><CheckCircle size={18}/><span>Already applied for this gig</span></div>
          : slotsLeft<=0 ? <div className="text-center text-slate-500 font-semibold py-1">All slots filled</div>
          : <button onClick={() => { onClose(); onApply(job); }} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"><Send size={16}/>Apply Now</button>}
        </div>
      </div>
    </div>
  );
};

// ─── LOADING SKELETON ─────────────────────────────────────────────────────────
const Skeleton = ({ className }) => <div className={`bg-slate-100 animate-pulse rounded-xl ${className}`}/>;

// ─── MAIN WORKER DASHBOARD ────────────────────────────────────────────────────
const WorkerDashboard = () => {
  const navigate = useNavigate();

  const [activeTab,    setActiveTab]    = useState('browse');
  const [sidebarOpen,  setSidebarOpen]  = useState(false);

  const [dashboardData,  setDashboardData]  = useState(null);
  const [availableJobs,  setAvailableJobs]  = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [appliedJobIds,  setAppliedJobIds]  = useState(new Set());
  const [kycStatus,      setKycStatus]      = useState(localStorage.getItem('kycStatus') || 'pending');

  const [loadingDash,   setLoadingDash]   = useState(true);
  const [loadingJobs,   setLoadingJobs]   = useState(true);
  const [loadingApps,   setLoadingApps]   = useState(false);
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [applyingJob,   setApplyingJob]   = useState(null);
  const [previewJob,    setPreviewJob]    = useState(null);
  const [showKycModal,  setShowKycModal]  = useState(false);
  const [ratingApp,     setRatingApp]     = useState(null);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [filterCat,     setFilterCat]     = useState('');
  const [errorMsg,      setErrorMsg]      = useState('');
  const [chatApp,       setChatApp]       = useState(null);
  const [showChatWindow,setShowChatWindow]= useState(false);

  const userName  = localStorage.getItem('userName')  || 'Volunteer';
  const userEmail = localStorage.getItem('userEmail') || '';

  // Inject font
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { if (document.head.contains(link)) document.head.removeChild(link); };
  }, []);

  const handleLogout = () => {
    ['token','userRole','userId','userName','userEmail','kycStatus'].forEach(k => localStorage.removeItem(k));
    navigate('/login');
  };

  const fetchDashboard = useCallback(async () => {
    setLoadingDash(true);
    const [dashRes, kycRes] = await Promise.all([apiFetch('/api/workers/dashboard'), apiFetch('/api/kyc/my')]);
    if (dashRes.success) setDashboardData(dashRes.data);
    else setErrorMsg(dashRes.message || 'Failed to load dashboard.');
    if (kycRes.success) { setKycStatus(kycRes.data.kycStatus); localStorage.setItem('kycStatus', kycRes.data.kycStatus); }
    setLoadingDash(false);
  }, []);

  const fetchJobs = useCallback(async (search='', category='') => {
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
      setMyApplications(data.data.applications);
      const ids = new Set(data.data.applications.filter(a => a.status !== 'Withdrawn').map(a => a.jobId?._id).filter(Boolean));
      setAppliedJobIds(ids);
    }
    setLoadingApps(false);
  }, []);

  useEffect(() => { fetchDashboard(); fetchJobs(); fetchMyApplications(); }, []);
  useEffect(() => { const t = setTimeout(() => fetchJobs(searchQuery, filterCat), 400); return () => clearTimeout(t); }, [searchQuery, filterCat]);
  useEffect(() => { if (activeTab === 'applications') fetchMyApplications(); }, [activeTab]);

  const handleApplyClick = (job) => {
    if (kycStatus !== 'verified') { setShowKycModal(true); return; }
    setApplyingJob(job);
  };
  const handleApplySuccess = (jobId) => {
    setAppliedJobIds(prev => new Set([...prev, jobId]));
    fetchMyApplications(); fetchDashboard();
  };
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
  const handleRatingSuccess = () => { fetchMyApplications(); fetchDashboard(); };

  const formatPay = (pay) => !pay ? '—' : `₹${pay.amount?.toLocaleString('en-IN')}${paySuffix(pay.type) || ' fixed'}`;

  // Level calculation — preserved exactly
  const currentLevelKey = dashboardData?.stats?.currentLevel || 'beginner';
  const completedCount  = dashboardData?.stats?.totalGigsCompleted || 0;
  const currentLevelObj = LEVELS.find(l => l.key === currentLevelKey) || LEVELS[0];
  const nextLevelObj    = LEVELS[LEVELS.indexOf(currentLevelObj) + 1];
  const progressPct     = nextLevelObj ? Math.min(100, Math.round(((completedCount - currentLevelObj.min) / (nextLevelObj.min - currentLevelObj.min)) * 100)) : 100;
  const gigsToNext      = nextLevelObj ? Math.max(0, nextLevelObj.min - completedCount) : 0;
  const today = new Date(); today.setHours(0,0,0,0);

  const statsCards = [
    { label:'Total Earnings', value:`₹${(dashboardData?.stats?.totalEarnings||0).toLocaleString('en-IN')}`, icon:DollarSign,  color:'bg-emerald-500', light:'bg-emerald-50 text-emerald-700' },
    { label:'Gigs Completed', value:String(dashboardData?.stats?.totalGigsCompleted||0),                    icon:CheckCircle, color:'bg-blue-500',    light:'bg-blue-50 text-blue-700'     },
    { label:'Avg Rating',     value:dashboardData?.stats?.averageRating?dashboardData.stats.averageRating.toFixed(1):'—', icon:Star, color:'bg-amber-500', light:'bg-amber-50 text-amber-700' },
    { label:'Reliability',    value:`${dashboardData?.stats?.reliabilityScore||100}%`,                      icon:Award,       color:'bg-violet-500',  light:'bg-violet-50 text-violet-700' },
  ];

  const acceptedCount  = myApplications.filter(a=>a.status==='Accepted').length;
  const pendingCount   = myApplications.filter(a=>a.status==='Pending').length;

  const NAV_ITEMS = [
    { id:'browse',       label:'Browse Gigs',     icon:Search,      badge:null },
    { id:'applications', label:'My Applications', icon:Clock,       badge:acceptedCount>0?acceptedCount:null },
    { id:'scheduled',    label:'Upcoming',        icon:Calendar,    badge:null },
    { id:'completed',    label:'Completed',       icon:CheckCircle, badge:null },
    { id:'portfolio',    label:'Portfolio',       icon:Award,       badge:null },
    { id:'earnings',     label:'Earnings',        icon:DollarSign,  badge:null },
  ];

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif" }} className="min-h-screen bg-slate-50">

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-15 py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors" aria-label="Toggle menu">
                <Menu size={20} className="text-slate-600"/>
              </button>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                  <Briefcase className="text-white" size={16}/>
                </div>
                <span className="text-lg font-extrabold text-slate-900 tracking-tight">Gig<span className="text-indigo-600">Xpress</span></span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* KYC pill */}
              {kycStatus==='verified'
                ? <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold"><CheckCircle size={11}/>Verified</span>
                : <button onClick={() => navigate('/kyc')}
                    className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                      kycStatus==='rejected' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                      : kycStatus==='in_progress' ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                    }`}>
                    <Shield size={11}/>
                    {kycStatus==='rejected'?'KYC Rejected':kycStatus==='in_progress'?'In Review':'Complete KYC'}
                  </button>}

              <NotificationBell onNavigate={navigate}/>

              <button onClick={() => navigate('/profile')} className="flex items-center gap-2.5 pl-3 border-l border-slate-100 hover:bg-slate-50 py-1 px-2 rounded-xl transition-colors">
                <img src={`https://i.pravatar.cc/150?u=${userEmail}`} alt="Profile" className="w-8 h-8 rounded-full ring-2 ring-slate-100"/>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-bold text-slate-900 leading-tight">{userName}</p>
                  <p className="text-xs text-slate-400 capitalize">{currentLevelObj.label}</p>
                </div>
              </button>

              <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors ml-1" title="Logout">
                <LogOut size={17}/>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Mobile overlay */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => setSidebarOpen(false)}/>}

        {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
        <aside className={`${sidebarOpen?'translate-x-0':'-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-60 bg-white border-r border-slate-100 transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none`}>
          <div className="p-4 space-y-4 pt-4">
            {/* Level card */}
            {loadingDash
              ? <Skeleton className="h-24"/>
              : <div className="bg-indigo-600 rounded-2xl p-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Trophy size={16} className="text-indigo-200"/>
                      <span className="font-bold text-sm">{currentLevelObj.label}</span>
                    </div>
                    <span className="text-xs text-indigo-200 font-medium">{completedCount} gigs</span>
                  </div>
                  <p className="text-xs text-indigo-200 mb-2.5">
                    {nextLevelObj ? `${gigsToNext} more gig${gigsToNext!==1?'s':''} to reach ${nextLevelObj.label}` : '🎉 Max level reached!'}
                  </p>
                  <div className="w-full bg-indigo-500/50 rounded-full h-1.5">
                    <div className="bg-white h-1.5 rounded-full transition-all duration-700" style={{ width:`${progressPct}%` }}/>
                  </div>
                </div>}

            {/* Nav items */}
            <nav className="space-y-0.5">
              {NAV_ITEMS.map(item => (
                <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeTab===item.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}>
                  <item.icon size={17} strokeWidth={activeTab===item.id?2.5:2}/>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="bg-indigo-600 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">{item.badge}</span>
                  )}
                </button>
              ))}
            </nav>

            {/* Quick stats summary */}
            {!loadingDash && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Activity</p>
                <div className="grid grid-cols-2 gap-2">
                  {[{label:'Pending', val:pendingCount, color:'text-amber-600'},{label:'Accepted', val:acceptedCount, color:'text-emerald-600'}].map(item=>(
                    <div key={item.label} className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                      <p className={`text-lg font-extrabold ${item.color}`}>{item.val}</p>
                      <p className="text-xs text-slate-400 font-medium">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
        <main className="flex-1 p-4 sm:p-6 min-w-0">

          {/* Error banner */}
          {errorMsg && (
            <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-3.5 flex gap-3 items-center">
              <AlertCircle className="text-red-500 shrink-0" size={17}/>
              <p className="text-red-700 text-sm flex-1">{errorMsg}</p>
              <button onClick={()=>setErrorMsg('')} className="text-red-400 hover:text-red-600 transition-colors"><X size={15}/></button>
            </div>
          )}

          <KycBanner kycStatus={kycStatus} onNavigate={() => navigate('/kyc')}/>

          {/* ══ BROWSE GIGS ══ */}
          {activeTab==='browse' && (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">Browse Gigs</h1>
                  <p className="text-slate-500 text-sm mt-0.5">Find opportunities that match your skills</p>
                </div>
                <button onClick={() => fetchJobs(searchQuery,filterCat)} className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-sm font-semibold text-slate-600 transition-colors">
                  <RefreshCw size={14}/> Refresh
                </button>
              </div>

              {/* Stats row */}
              {loadingDash
                ? <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[...Array(4)].map((_,i)=><Skeleton key={i} className="h-24"/>)}</div>
                : <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {statsCards.map((stat,i) => (
                      <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                        <div className={`w-9 h-9 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                          <stat.icon size={18} className="text-white"/>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                        <p className="text-xl font-extrabold text-slate-900 mt-0.5">{stat.value}</p>
                      </div>
                    ))}
                  </div>}

              {/* Search + filter */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16}/>
                  <input type="text" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
                    placeholder="Search gigs by title..."
                    className="pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl w-full focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none bg-white text-sm"/>
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14}/>
                  <select value={filterCat} onChange={e=>setFilterCat(e.target.value)}
                    className="pl-9 pr-7 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-400 outline-none text-sm appearance-none cursor-pointer min-w-[160px]">
                    <option value="">All Categories</option>
                    {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                </div>
              </div>

              {/* Job list */}
              {loadingJobs
                ? <div className="space-y-3">{[...Array(3)].map((_,i)=><Skeleton key={i} className="h-36"/>)}</div>
                : availableJobs.length===0
                  ? <div className="bg-white rounded-2xl border border-slate-100 p-14 text-center">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Search size={24} className="text-slate-400"/>
                      </div>
                      <h3 className="text-base font-bold text-slate-700 mb-1">No gigs found</h3>
                      <p className="text-slate-400 text-sm">Try different keywords or clear the category filter</p>
                    </div>
                  : <div className="space-y-3">
                      {availableJobs.map(job => {
                        const alreadyApplied = appliedJobIds.has(job._id);
                        const slotsLeft = job.slotsTotal - job.slotsFilled;
                        const isFull = slotsLeft <= 0;
                        const isCompleted = isJobCompleted(job);
                        return (
                          <div key={job._id}
                            className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-md group ${
                              job.urgent ? 'border-red-100 hover:border-red-200' : 'border-slate-100 hover:border-indigo-100'
                            }`}>
                            <div className="p-5">
                              {/* Top row */}
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    {job.urgent && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-full text-xs font-bold"><Zap size={10}/>Urgent</span>}
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">{job.category}</span>
                                  </div>
                                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors truncate">{job.title}</h3>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-sm text-slate-500 font-medium">{job.organizerId?.fullName||'Organiser'}</span>
                                    <CheckCircle size={12} className="text-emerald-500"/>
                                  </div>
                                </div>
                                {/* Pay — primary callout */}
                                <div className="text-right shrink-0">
                                  <p className="text-xl font-extrabold text-indigo-600">{formatPay(job.pay)}</p>
                                  <p className={`text-xs font-semibold mt-0.5 ${isFull?'text-red-500':'text-slate-400'}`}>{isFull?'No slots left':`${slotsLeft} slot${slotsLeft!==1?'s':''} left`}</p>
                                </div>
                              </div>

                              {/* Skills */}
                              {job.requiredSkills?.length>0 && (
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                  {job.requiredSkills.map(s=><span key={s} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-xs font-medium">{s}</span>)}
                                </div>
                              )}

                              {/* Meta row */}
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mb-4">
                                <span className="flex items-center gap-1"><MapPin size={12} className="text-slate-400"/>{job.location?.city}</span>
                                <span className="flex items-center gap-1"><Calendar size={12} className="text-slate-400"/>{new Date(job.date).toLocaleDateString('en-IN')} • {job.time}</span>
                                <span className="flex items-center gap-1"><Clock size={12} className="text-slate-400"/>{job.duration}</span>
                                <span className="flex items-center gap-1"><Users size={12} className="text-slate-400"/>{job.slotsTotal} needed</span>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2">
                                {isCompleted
                                  ? <div className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-sm font-semibold">
                                      <CheckCircle size={14}/>Completed
                                    </div>
                                  : alreadyApplied
                                  ? <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-semibold">
                                      <CheckCircle size={14}/>Applied
                                    </div>
                                  : <button onClick={() => handleApplyClick(job)} disabled={isFull}
                                      className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                                      {isFull?'Full':'Apply Now'}
                                    </button>}
                                <button onClick={() => setPreviewJob(job)} className="px-3.5 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-sm font-semibold text-slate-600 flex items-center gap-1.5 transition-colors">
                                  <Eye size={14}/>Details
                                </button>
                                <button className="p-2 border border-slate-200 rounded-xl hover:bg-pink-50 hover:text-pink-500 hover:border-pink-200 text-slate-400 ml-auto transition-colors" title="Save">
                                  <Heart size={15}/>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>}
            </div>
          )}

          {/* ══ MY APPLICATIONS ══ */}
          {activeTab==='applications' && (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">My Applications</h1>
                  <p className="text-slate-500 text-sm mt-0.5">{myApplications.length} total application{myApplications.length!==1?'s':''}</p>
                </div>
                <button onClick={fetchMyApplications} className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-sm font-semibold text-slate-600 transition-colors">
                  <RefreshCw size={14}/> Refresh
                </button>
              </div>

              {loadingApps
                ? <div className="space-y-3">{[...Array(3)].map((_,i)=><Skeleton key={i} className="h-28"/>)}</div>
                : myApplications.length===0
                  ? <div className="bg-white rounded-2xl border border-slate-100 p-14 text-center">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><Clock size={24} className="text-slate-400"/></div>
                      <h3 className="text-base font-bold text-slate-700 mb-1">No applications yet</h3>
                      <p className="text-slate-400 text-sm mb-5">Browse gigs and start applying to see your history here</p>
                      <button onClick={()=>setActiveTab('browse')} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors">Browse Gigs</button>
                    </div>
                  : <div className="space-y-3">
                      {myApplications.map(app => {
                        const job = app.jobId;
                        const isGigCompleted = app.status==='Completed';
                        const alreadyRatedOrganizer = !!app.organizerRating?.score;
                        return (
                          <div key={app._id} className="bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all">
                            <div className="p-5">
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <h3 className="text-base font-bold text-slate-900 leading-tight">{job?.title||'Job'}</h3>
                                      <p className="text-sm text-slate-500 mt-0.5">{app.organizerId?.fullName}</p>
                                    </div>
                                    <StatusBadge status={app.status}/>
                                  </div>
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 mt-2.5">
                                    {job?.date&&<span className="flex items-center gap-1"><Calendar size={11}/>{new Date(job.date).toLocaleDateString('en-IN')}</span>}
                                    {job?.pay&&<span className="flex items-center gap-1 font-semibold text-slate-600"><DollarSign size={11}/>{formatPay(job.pay)}</span>}
                                    {job?.location&&<span className="flex items-center gap-1"><MapPin size={11}/>{job.location.city}</span>}
                                    <span className="flex items-center gap-1"><Clock size={11}/>Applied {new Date(app.appliedAt).toLocaleDateString('en-IN')}</span>
                                  </div>
                                  {app.coverNote&&<p className="text-xs text-slate-500 italic bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg mt-2.5">"{app.coverNote}"</p>}

                                  {/* Organiser rating of me */}
                                  {isGigCompleted&&app.workerRating?.score&&(
                                    <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                                      <p className="text-xs font-semibold text-blue-700 mb-1.5">Organiser's rating for you</p>
                                      <StarDisplay score={app.workerRating.score}/>
                                      {app.workerRating.review&&<p className="text-xs text-slate-600 mt-1 italic">"{app.workerRating.review}"</p>}
                                    </div>
                                  )}

                                  {/* My rating of organiser */}
                                  {alreadyRatedOrganizer&&(
                                    <div className="mt-2 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                                      <p className="text-xs font-semibold text-indigo-700 mb-1.5">Your rating for organiser</p>
                                      <StarDisplay score={app.organizerRating.score}/>
                                      {app.organizerRating.review&&<p className="text-xs text-slate-600 mt-1 italic">"{app.organizerRating.review}"</p>}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-50">
                                {app.status==='Accepted'&&<div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-bold"><CheckCircle size={13}/>Hired!</div>}
                                {app.status==='Pending'&&(
                                  <button onClick={()=>handleWithdraw(app._id)} disabled={withdrawingId===app._id}
                                    className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-50 transition-colors flex items-center gap-1.5 disabled:opacity-60">
                                    {withdrawingId===app._id?<Loader size={12} className="animate-spin"/>:<XCircle size={12}/>}Withdraw
                                  </button>
                                )}
                                {isGigCompleted&&!alreadyRatedOrganizer&&(
                                  <button onClick={()=>setRatingApp(app)}
                                    className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-colors flex items-center gap-1.5">
                                    <Star size={12}/>Rate Organiser
                                  </button>
                                )}
                                {(app.status==='Accepted'||app.status==='Completed')&&(
                                  <button onClick={()=>setChatApp(app)}
                                    className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-colors flex items-center gap-1.5">
                                    <MessageSquare size={12}/>Message
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>}
            </div>
          )}

          {/* ══ SCHEDULED ══ */}
          {activeTab==='scheduled' && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Upcoming Schedule</h1>
                <p className="text-slate-500 text-sm mt-0.5">Your confirmed upcoming gigs</p>
              </div>
              {(() => {
                const scheduled = myApplications.filter(a => a.status==='Accepted' && new Date(a.jobId?.date) >= today);
                if (loadingApps) return <Skeleton className="h-48"/>;
                if (scheduled.length===0) return (
                  <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-14 text-center">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><Calendar size={24} className="text-slate-400"/></div>
                    <h3 className="text-base font-bold text-slate-700 mb-1">Nothing scheduled</h3>
                    <p className="text-slate-400 text-sm mb-5">Get accepted for gigs to see your upcoming schedule</p>
                    <button onClick={()=>setActiveTab('browse')} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors">Explore Gigs</button>
                  </div>
                );
                return (
                  <div className="space-y-3">
                    {scheduled.map(app => {
                      const job = app.jobId;
                      const daysUntil = Math.ceil((new Date(job?.date) - today) / (1000 * 60 * 60 * 24));
                      return (
                        <div key={app._id} className="bg-white rounded-2xl border border-slate-100 p-5 flex gap-4 items-start hover:shadow-sm transition-all">
                          {/* Date badge */}
                          <div className="bg-indigo-600 rounded-2xl px-3 py-2.5 text-center text-white shrink-0 min-w-[56px]">
                            <p className="text-xs font-bold text-indigo-200 uppercase">{new Date(job?.date).toLocaleDateString('en-IN',{month:'short'})}</p>
                            <p className="text-2xl font-extrabold leading-tight">{new Date(job?.date).getDate()}</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-bold text-slate-900 text-base">{job?.title}</h3>
                                <p className="text-sm text-slate-500 mt-0.5">{app.organizerId?.fullName}</p>
                              </div>
                              <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold border ${daysUntil<=2?'bg-red-50 text-red-600 border-red-100':'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                                {daysUntil===0?'Today':daysUntil===1?'Tomorrow':`${daysUntil} days`}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 mt-2">
                              {job?.time&&<span className="flex items-center gap-1"><Clock size={11}/>{job.time}</span>}
                              {job?.location&&<span className="flex items-center gap-1"><MapPin size={11}/>{job.location.city}{job.location.address?` — ${job.location.address}`:''}</span>}
                              {job?.pay&&<span className="flex items-center gap-1 font-semibold text-emerald-600"><DollarSign size={11}/>{formatPay(job.pay)}</span>}
                            </div>
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
          {activeTab==='completed' && (() => {
            const completed = myApplications.filter(a => a.status==='Completed' && new Date(a.jobId?.date) < today);
            return (
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Completed Gigs</h1>
                    <p className="text-slate-500 text-sm mt-0.5">{completed.length} gig{completed.length!==1?'s':''} completed</p>
                  </div>
                </div>
                {loadingApps
                  ? <div className="space-y-3">{[...Array(3)].map((_,i)=><Skeleton key={i} className="h-32"/>)}</div>
                  : completed.length===0
                    ? <div className="bg-white rounded-2xl border border-slate-100 p-14 text-center">
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><CheckCircle size={24} className="text-slate-400"/></div>
                        <h3 className="text-base font-bold text-slate-700 mb-1">No completed gigs yet</h3>
                        <p className="text-slate-400 text-sm">Complete your first gig to see it here</p>
                      </div>
                    : <div className="space-y-3">
                        {completed.map(app => {
                          const job = app.jobId;
                          const alreadyRated = !!app.organizerRating?.score;
                          return (
                            <div key={app._id} className="bg-white rounded-2xl border-l-4 border-emerald-400 border border-slate-100 p-5 hover:shadow-sm transition-all group">
                              <div className="flex flex-col lg:flex-row gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-3 mb-2">
                                    <div>
                                      <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{job?.title}</h3>
                                      <p className="text-sm text-slate-500 mt-0.5">{app.organizerId?.fullName}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <p className="text-lg font-extrabold text-emerald-600">{formatPay(job?.pay)}</p>
                                      <p className="text-xs text-slate-400">Earned</p>
                                    </div>
                                  </div>

                                  {app.workerRating?.score
                                    ? <div className="mb-3">
                                        <div className="flex items-center gap-2 mb-1"><StarDisplay score={app.workerRating.score}/><span className="text-xs text-slate-400">from organiser</span></div>
                                        {app.workerRating.review&&<p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg italic">"{app.workerRating.review}"</p>}
                                      </div>
                                    : <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg mb-3 inline-block">Awaiting organiser rating…</p>}

                                  {alreadyRated
                                    ? <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                                        <p className="text-xs font-semibold text-indigo-700 mb-1.5">Your rating for organiser</p>
                                        <StarDisplay score={app.organizerRating.score}/>
                                        {app.organizerRating.review&&<p className="text-xs text-slate-600 mt-1 italic">"{app.organizerRating.review}"</p>}
                                      </div>
                                    : <button onClick={()=>setRatingApp(app)}
                                        className="mt-1 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-colors flex items-center gap-2">
                                        <Star size={14}/>Rate the Organiser
                                      </button>}

                                  {job?.date&&<p className="text-xs text-slate-400 mt-3">Completed {new Date(job.date).toLocaleDateString('en-IN')}</p>}
                                </div>
                                <div className="shrink-0">
                                  <button className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-600 transition-all flex items-center gap-2">
                                    <Download size={14}/>Certificate
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>}
              </div>
            );
          })()}

          {/* ══ PORTFOLIO ══ */}
          {activeTab==='portfolio' && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">My Portfolio</h1>
                <p className="text-slate-500 text-sm mt-0.5">Your achievements and career progression</p>
              </div>

              {/* Profile hero */}
              <div className="bg-indigo-600 rounded-2xl p-6 text-white">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  <img src={`https://i.pravatar.cc/150?u=${userEmail}`} alt="Profile" className="w-20 h-20 rounded-2xl border-4 border-indigo-500 shadow-xl object-cover"/>
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-2xl font-extrabold mb-0.5">{userName}</h2>
                    <p className="text-indigo-200 capitalize mb-4">{currentLevelObj.label} • {dashboardData?.profile?.location?.city||'Location not set'}</p>
                    <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                      {[
                        {label:'Gigs Done',  value:dashboardData?.stats?.totalGigsCompleted||0},
                        {label:'Avg Rating', value:dashboardData?.stats?.averageRating?dashboardData.stats.averageRating.toFixed(1):'—'},
                        {label:'Earned',     value:`₹${(dashboardData?.stats?.totalEarnings||0).toLocaleString('en-IN')}`},
                      ].map(({label,value})=>(
                        <div key={label} className="bg-indigo-500/50 px-4 py-2.5 rounded-xl backdrop-blur-sm">
                          <p className="text-xl font-extrabold">{value}</p>
                          <p className="text-xs text-indigo-200 uppercase tracking-wide">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills */}
              {dashboardData?.profile?.skills?.length>0&&(
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                  <h3 className="font-bold text-slate-900 mb-3">My Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {dashboardData.profile.skills.map(s=><span key={s} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl text-sm font-semibold">{s}</span>)}
                  </div>
                </div>
              )}

              {/* Badges */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900">Badges Earned</h3>
                  <span className="px-2.5 py-1 bg-violet-50 text-violet-700 border border-violet-100 rounded-full text-xs font-bold">{dashboardData?.stats?.badges?.length||0} badges</span>
                </div>
                {(dashboardData?.stats?.badges||[]).length===0
                  ? <div className="text-center py-8"><Award size={36} className="mx-auto text-slate-300 mb-2"/><p className="text-slate-400 text-sm">Complete gigs to earn badges</p></div>
                  : <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {dashboardData.stats.badges.map((badge,i)=>{
                        const style=BADGE_ICONS[badge.name]||{icon:'🏅',color:'bg-slate-50 text-slate-700 border border-slate-100'};
                        return(
                          <div key={i} className={`${style.color} rounded-2xl p-4 text-center hover:scale-105 transition-transform cursor-default`}>
                            <div className="text-3xl mb-2">{style.icon}</div>
                            <h4 className="font-bold text-sm">{badge.name}</h4>
                            {badge.awardedAt&&<p className="text-xs opacity-60 mt-0.5">{new Date(badge.awardedAt).toLocaleDateString('en-IN')}</p>}
                          </div>
                        );
                      })}
                    </div>}
              </div>

              {/* Career levels */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <h3 className="font-bold text-slate-900 mb-4">Career Progression</h3>
                <div className="space-y-2.5">
                  {LEVELS.map((level,i)=>{
                    const isCurrent=level.key===currentLevelKey;
                    const isPast=LEVELS.indexOf(level)<LEVELS.indexOf(currentLevelObj);
                    return(
                      <div key={level.key} className={`flex items-center gap-3.5 p-3 rounded-xl transition-all ${isCurrent?'bg-indigo-50 border border-indigo-100':'hover:bg-slate-50'}`}>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 ${isCurrent?'bg-indigo-600':isPast?'bg-emerald-500':'bg-slate-200 text-slate-400'}`}>
                          {isPast?<CheckCircle size={16}/>:i+1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`font-bold text-sm ${isCurrent?'text-indigo-700':isPast?'text-emerald-600':'text-slate-400'}`}>{level.label}</h4>
                            <span className="text-xs text-slate-400">{level.gigs} gigs</span>
                          </div>
                          {isCurrent&&nextLevelObj&&(
                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-700" style={{width:`${progressPct}%`}}/>
                            </div>
                          )}
                        </div>
                        {isCurrent&&<Target className="text-indigo-500 shrink-0" size={18}/>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ══ EARNINGS ══ */}
          {activeTab==='earnings' && (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">Earnings</h1>
                  <p className="text-slate-500 text-sm mt-0.5">Your payment history and summary</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  {label:'Total Earnings',  val:`₹${(dashboardData?.stats?.totalEarnings||0).toLocaleString('en-IN')}`,        icon:DollarSign,  color:'bg-emerald-500'},
                  {label:'This Month',      val:`₹${(dashboardData?.stats?.currentMonthEarnings||0).toLocaleString('en-IN')}`,  icon:TrendingUp,  color:'bg-indigo-600'},
                  {label:'Gigs Completed',  val:String(dashboardData?.stats?.totalGigsCompleted||0),                            icon:CheckCircle, color:'bg-blue-500'},
                ].map((item,i)=>(
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-sm transition-all">
                    <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center mb-3`}><item.icon size={20} className="text-white"/></div>
                    <p className="text-xs text-slate-500 font-medium">{item.label}</p>
                    <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{item.val}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-900">Payment History</h3>
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"><Download size={13}/>Export</button>
                </div>
                {(dashboardData?.completedGigs||[]).length===0
                  ? <div className="text-center py-10"><DollarSign size={36} className="mx-auto text-slate-300 mb-2"/><p className="text-slate-400 text-sm">No payments yet — complete gigs to earn</p></div>
                  : <div className="space-y-2">
                      {(dashboardData?.completedGigs||[]).map(app=>(
                        <div key={app._id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-emerald-50/30 hover:border-emerald-100 transition-all group">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                              <CheckCircle className="text-emerald-600" size={18}/>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">{app.jobId?.title}</p>
                              <p className="text-xs text-slate-400">{app.jobId?.date?new Date(app.jobId.date).toLocaleDateString('en-IN'):''}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-900 text-sm">{formatPay(app.jobId?.pay)}</p>
                            <p className="text-xs text-emerald-600 font-semibold">Paid</p>
                          </div>
                        </div>
                      ))}
                    </div>}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── MODALS ─────────────────────────────────────────────────────────── */}
      {applyingJob&&<ApplyModal job={applyingJob} onClose={()=>setApplyingJob(null)} onSuccess={handleApplySuccess} onKycBlock={handleKycBlock}/>}
      {previewJob&&<JobDetailModal job={previewJob} onClose={()=>setPreviewJob(null)} onApply={handleApplyClick} appliedJobIds={appliedJobIds} kycStatus={kycStatus}/>}
      {showKycModal&&<KycRequiredModal kycStatus={kycStatus} onClose={()=>setShowKycModal(false)}/>}
      {ratingApp&&<RateOrganizerModal application={ratingApp} onClose={()=>setRatingApp(null)} onSuccess={handleRatingSuccess}/>}
      {chatApp&&(
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <ChatWindow applicationId={chatApp?._id} onClose={()=>setChatApp(null)}/>
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;


