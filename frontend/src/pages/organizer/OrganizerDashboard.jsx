import React, { useState, useEffect, useCallback } from 'react';
import {
  Briefcase, Plus, Users, Clock, MessageSquare, DollarSign, CheckCircle,
  Star, MapPin, Calendar, Edit, Trash2, Eye, UserCheck,
  TrendingUp, AlertCircle, Download, BarChart3,
  Menu, X, Loader, RefreshCw, CheckSquare, XSquare,
  LogOut, Shield, XCircle, Zap, ChevronRight, Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChatWindow from '../../components/ChatWindow';
import NotificationBell from '../../components/NotificationBell';
import { StarDisplay, StarRatingInput } from '../../components/common/StarRating';
import { EVENT_CATEGORIES as CATEGORIES } from '../../constants/events';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiFetch = async (path, options = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  return res.json();
};

const SKILL_OPTIONS = [
  'Event Management','Hospitality','Marketing','Technical Support',
  'AV Setup','Crowd Management','Registration Desk','Photography','Decoration',
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const Skeleton = ({ className }) => <div className={`bg-slate-100 animate-pulse rounded-xl ${className}`}/>;

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

const newestApplicationFirst = (a, b) => {
  const bTime = new Date(b?.appliedAt || b?.createdAt || 0).getTime();
  const aTime = new Date(a?.appliedAt || a?.createdAt || 0).getTime();
  return bTime - aTime;
};

const jobStatusConfig = {
  Active:    { cls: 'bg-emerald-50 text-emerald-700 border border-emerald-100', dot: 'bg-emerald-400' },
  Paused:    { cls: 'bg-amber-50 text-amber-700 border border-amber-100',       dot: 'bg-amber-400'   },
  Completed: { cls: 'bg-blue-50 text-blue-700 border border-blue-100',          dot: 'bg-blue-400'    },
  Cancelled: { cls: 'bg-red-50 text-red-700 border border-red-100',             dot: 'bg-red-400'     },
};
const JobStatusBadge = ({ status, isCompleted }) => {
  const s = isCompleted ? 'Completed' : status;
  const cfg = jobStatusConfig[s] || { cls: 'bg-slate-100 text-slate-600', dot: 'bg-slate-300' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}/>
      {s}
    </span>
  );
};

// ─── RATE WORKER MODAL ────────────────────────────────────────────────────────
const RateWorkerModal = ({ application, onClose, onSuccess }) => {
  const [score,   setScore]   = useState(5);
  const [review,  setReview]  = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const worker = application.workerId;

  const handleSubmit = async () => {
    if (!score || score < 1) { setError('Please select a star rating.'); return; }
    setLoading(true); setError('');
    const data = await apiFetch(`/api/applications/${application._id}/complete`, {
      method: 'PATCH', body: JSON.stringify({ score, review }),
    });
    setLoading(false);
    if (data.success) { onSuccess(); onClose(); }
    else setError(data.message || 'Failed to submit rating.');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Rate & Complete Gig</h3>
            <p className="text-sm text-slate-500 mt-0.5">How did {worker?.fullName||'this worker'} perform?</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"><X size={20}/></button>
        </div>
        <div className="p-5 space-y-4">
          {/* Worker card */}
          <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <img src={worker?.profilePicture||`https://i.pravatar.cc/150?u=${worker?._id}`} alt={worker?.fullName}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-sm"/>
            <div>
              <p className="font-bold text-slate-900 text-sm">{worker?.fullName}</p>
              <p className="text-xs text-slate-400">{worker?.email}</p>
            </div>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex gap-2">
              <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5"/><p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2.5">Rating <span className="text-red-400">*</span></label>
            <StarRatingInput value={score} onChange={setScore}/>
            <p className="text-xs text-amber-600 font-medium mt-1.5">
              {score===1&&'⭐ Poor'}{score===2&&'⭐⭐ Below Average'}{score===3&&'⭐⭐⭐ Average'}{score===4&&'⭐⭐⭐⭐ Good'}{score===5&&'⭐⭐⭐⭐⭐ Excellent'}
              <span className="text-slate-400 font-normal ml-1">({score}/5)</span>
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Review <span className="font-normal text-slate-400">(optional)</span></label>
            <textarea value={review} onChange={e=>setReview(e.target.value)} rows={3} maxLength={300} disabled={loading}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none text-sm resize-none bg-slate-50 focus:bg-white transition-colors"
              placeholder="Performance, punctuality, attitude..."/>
            <p className="text-xs text-slate-400 mt-1 text-right">{review.length}/300</p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 flex gap-2.5">
            <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5"/>
            <p className="text-xs text-amber-700 font-medium">This action is permanent — it finalises the gig and cannot be undone.</p>
          </div>
        </div>
        <div className="p-5 border-t border-slate-100 flex gap-3 justify-end">
          <button onClick={onClose} disabled={loading} className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors text-slate-700">Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-60">
            {loading?<><Loader size={15} className="animate-spin"/>Submitting...</>:<><CheckCircle size={15}/>Complete & Rate</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── KYC REQUIRED MODAL ───────────────────────────────────────────────────────
const KycRequiredModal = ({ kycStatus, onClose }) => {
  const navigate = useNavigate();
  const isRejected   = kycStatus === 'rejected';
  const isInProgress = kycStatus === 'in_progress';
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-7 text-center border border-slate-100">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isRejected?'bg-red-50':isInProgress?'bg-amber-50':'bg-indigo-50'}`}>
          {isRejected?<XCircle className="text-red-500" size={32}/>:isInProgress?<Clock className="text-amber-500" size={32}/>:<Shield className="text-indigo-600" size={32}/>}
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1.5">{isRejected?'KYC Rejected':isInProgress?'KYC Under Review':'KYC Required to Post Jobs'}</h3>
        <p className="text-slate-500 text-sm mb-5 leading-relaxed">{isRejected?'Re-submit with clearer documents.':isInProgress?'Under review (24–48 hrs). Job posting unlocks once verified.':'Complete KYC to start posting jobs.'}</p>
        <div className="space-y-2.5">
          {!isInProgress&&<button onClick={()=>{onClose();navigate('/kyc');}} className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"><Shield size={16}/>{isRejected?'Re-submit KYC':'Complete KYC Now'}</button>}
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
    pending:     { bg:'bg-amber-50 border-amber-200', Icon:AlertCircle, ic:'text-amber-500', text:'Complete KYC to post jobs and hire workers.', btn:'Complete KYC',  bc:'bg-amber-500 hover:bg-amber-600 text-white' },
    in_progress: { bg:'bg-blue-50 border-blue-200',   Icon:Clock,       ic:'text-blue-500',  text:'KYC under review (24–48 hrs). Job posting unlocks once approved.', btn:null, bc:'' },
    rejected:    { bg:'bg-red-50 border-red-200',     Icon:XCircle,     ic:'text-red-500',   text:'KYC rejected. Re-submit your documents to post jobs.', btn:'Re-submit KYC', bc:'bg-red-500 hover:bg-red-600 text-white' },
  };
  const cfg = cfgs[kycStatus]; if (!cfg) return null;
  const { Icon } = cfg;
  return (
    <div className={`mb-5 border rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center gap-3 ${cfg.bg}`}>
      <Icon className={`shrink-0 ${cfg.ic}`} size={18}/>
      <p className="text-sm text-slate-700 flex-1 font-medium">{cfg.text}</p>
      {cfg.btn&&<button onClick={onNavigate} className={`shrink-0 px-4 py-1.5 ${cfg.bc} rounded-lg text-sm font-bold transition-colors`}>{cfg.btn}</button>}
    </div>
  );
};

// ─── JOB MODAL ────────────────────────────────────────────────────────────────
const JobModal = ({ onClose, onCreate, editJob=null, kycStatus }) => {
  const navigate = useNavigate();
  const isEdit   = !!editJob;

  const [form, setForm] = useState({
    title:          editJob?.title          || '',
    location:       editJob?.location?.city || '',
    date:           editJob?.date ? new Date(editJob.date).toISOString().split('T')[0] : '',
    time:           editJob?.time           || '09:00',
    duration:       editJob?.duration       || 'Full Day',
    slotsTotal:     editJob?.slotsTotal     || '',
    pay:            editJob?.pay?.amount    || '',
    payType:        editJob?.pay?.type === 'hourly' ? 'per_hour' : (editJob?.pay?.type || 'per_day'),
    category:       editJob?.category       || 'Other',
    description:    editJob?.description    || '',
    requirements:   editJob?.requirements   || '',
    requiredSkills: editJob?.requiredSkills || [],
    urgent:         editJob?.urgent         || false,
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [showKyc, setShowKyc] = useState(false);

  const hc = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type==='checkbox'?checked:value }));
  };
  const toggleSkill = (s) => setForm(p => ({
    ...p,
    requiredSkills: p.requiredSkills.includes(s) ? p.requiredSkills.filter(x=>x!==s) : [...p.requiredSkills, s],
  }));

  const handleSubmit = async () => {
    if (kycStatus !== 'verified') { setShowKyc(true); return; }
    if (!form.title||!form.location||!form.date||!form.time||!form.slotsTotal||!form.pay) {
      setError('Please fill all required fields.'); return;
    }
    setLoading(true); setError('');
    const payload = {
      title: form.title.trim(), location: form.location.trim(), date: form.date,
      time: form.time, duration: form.duration, slotsTotal: Number(form.slotsTotal),
      pay: { amount: Number(form.pay), type: form.payType }, category: form.category,
      description: form.description.trim(), requirements: form.requirements.trim(),
      requiredSkills: form.requiredSkills, urgent: form.urgent,
    };
    try {
      const data = isEdit
        ? await apiFetch(`/api/jobs/${editJob._id}`, { method:'PUT', body:JSON.stringify(payload) })
        : await apiFetch('/api/jobs', { method:'POST', body:JSON.stringify(payload) });
      if (data.success) { onCreate(data.data.job); onClose(); }
      else if (data.kycRequired) setShowKyc(true);
      else setError(data.message||'Failed to save job.');
    } catch { setError('Unable to connect to server.'); }
    finally { setLoading(false); }
  };

  const totalBudget = form.pay && form.slotsTotal ? Number(form.pay)*Number(form.slotsTotal) : null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur z-10 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{isEdit?'Edit Job':'Post a New Job'}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{isEdit?'Update job details':'Fill in the details to start receiving applicants'}</p>
            </div>
            <button onClick={onClose} disabled={loading} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"><X size={20}/></button>
          </div>

          <div className="p-5 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 flex gap-2.5">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16}/>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Section: Basic Info */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Basic Info</p>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Job Title <span className="text-red-400">*</span></label>
                <input type="text" name="title" value={form.title} onChange={hc} disabled={loading}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none text-sm bg-slate-50 focus:bg-white transition-colors"
                  placeholder="e.g., Wedding Event Staff Required"/>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">City <span className="text-red-400">*</span></label>
                  <input type="text" name="location" value={form.location} onChange={hc} disabled={loading}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none text-sm bg-slate-50 focus:bg-white transition-colors"
                    placeholder="Pune"/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                  <select name="category" value={form.category} onChange={hc} disabled={loading}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none text-sm bg-slate-50 focus:bg-white transition-colors">
                    {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Section: Schedule */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Schedule</p>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date <span className="text-red-400">*</span></label>
                  <input type="date" name="date" value={form.date} onChange={hc} disabled={loading}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none text-sm bg-slate-50 focus:bg-white transition-colors"/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Time <span className="text-red-400">*</span></label>
                  <input type="time" name="time" value={form.time} onChange={hc} disabled={loading}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none text-sm bg-slate-50 focus:bg-white transition-colors"/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Duration</label>
                  <select name="duration" value={form.duration} onChange={hc} disabled={loading}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none text-sm bg-slate-50 focus:bg-white transition-colors">
                    {['Full Day','Half Day','2 Hours','4 Hours','6 Hours','8 Hours'].map(d=><option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Section: Compensation */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Compensation</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Workers Needed <span className="text-red-400">*</span></label>
                  <input type="number" name="slotsTotal" value={form.slotsTotal} onChange={hc} disabled={loading} min="1"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none text-sm bg-slate-50 focus:bg-white transition-colors"
                    placeholder="5"/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Pay per Worker (₹) <span className="text-red-400">*</span></label>
                  <div className="flex gap-2">
                    <input type="number" name="pay" value={form.pay} onChange={hc} disabled={loading} min="0"
                      className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none text-sm bg-slate-50 focus:bg-white transition-colors"
                      placeholder="1500"/>
                    <select name="payType" value={form.payType} onChange={hc} disabled={loading}
                      className="px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none text-sm bg-slate-50 focus:bg-white transition-colors">
                      <option value="per_day">/day</option>
                      <option value="per_hour">/hr</option>
                      <option value="fixed">fixed</option>
                    </select>
                  </div>
                </div>
              </div>
              {/* Budget preview */}
              {totalBudget !== null && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <DollarSign size={16} className="text-indigo-500"/>
                    <div>
                      <p className="text-xs font-semibold text-indigo-700">Total Escrow Required</p>
                      <p className="text-xs text-indigo-500">{form.slotsTotal} workers × ₹{Number(form.pay).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <p className="text-xl font-extrabold text-indigo-700">₹{totalBudget.toLocaleString('en-IN')}</p>
                </div>
              )}
            </div>

            {/* Section: Requirements */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Requirements</p>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Required Skills</label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map(s=>(
                    <button key={s} type="button" onClick={()=>toggleSkill(s)} disabled={loading}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                        form.requiredSkills.includes(s)
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                      }`}>{s}</button>
                  ))}
                </div>
                {form.requiredSkills.length>0&&<p className="text-xs text-indigo-600 font-semibold mt-2">✓ {form.requiredSkills.length} skill{form.requiredSkills.length!==1?'s':''} selected</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                <textarea name="description" value={form.description} onChange={hc} disabled={loading} rows={3}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none text-sm bg-slate-50 focus:bg-white transition-colors resize-none"
                  placeholder="Describe responsibilities and what workers should expect..."/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Special Requirements</label>
                <textarea name="requirements" value={form.requirements} onChange={hc} disabled={loading} rows={2}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none text-sm bg-slate-50 focus:bg-white transition-colors resize-none"
                  placeholder="e.g., Formal dress code, must carry Aadhaar..."/>
              </div>
            </div>

            {/* Urgent toggle */}
            <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${form.urgent?'border-red-200 bg-red-50':'border-slate-200 bg-slate-50 hover:border-slate-300'}`}>
              <input type="checkbox" name="urgent" checked={form.urgent} onChange={hc} disabled={loading} className="w-4 h-4 accent-red-500"/>
              <div>
                <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5"><Zap size={14} className="text-red-500"/>Mark as Urgent</p>
                <p className="text-xs text-slate-500 mt-0.5">Shown with priority badge to attract faster applicants</p>
              </div>
            </label>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex gap-3 justify-end sticky bottom-0">
            <button onClick={onClose} disabled={loading}
              className="px-5 py-2.5 border border-slate-200 rounded-xl font-semibold text-sm text-slate-700 hover:bg-white transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm shadow-indigo-200 disabled:opacity-60">
              {loading?<><Loader size={16} className="animate-spin"/>Saving...</>:isEdit?'Save Changes':'Publish Job'}
            </button>
          </div>
        </div>
      </div>
      {showKyc&&<KycRequiredModal kycStatus={kycStatus} onClose={()=>setShowKyc(false)}/>}
    </>
  );
};

// ─── APPLICATIONS MODAL ───────────────────────────────────────────────────────
const ApplicationsModal = ({ job, focusedApplication=null, onClose, onRespond }) => {
  const [applications, setApplications] = useState(() => focusedApplication ? [focusedApplication] : []);
  const [loading,      setLoading]      = useState(!focusedApplication);
  const [responding,   setResponding]   = useState(null);
  const [ratingApp,    setRatingApp]    = useState(null);
  const [chatApp,      setChatApp]      = useState(null);

  const today = new Date(); today.setHours(0,0,0,0);
  const isGigDatePast = job.date ? new Date(job.date) < today : false;

  const load = async () => {
    setLoading(true);
    const data = await apiFetch(`/api/applications/job/${job._id}`);
    if (data.success) setApplications(data.data.applications);
    setLoading(false);
  };
  useEffect(() => { load(); }, [job._id, focusedApplication?._id]);

  const handleRespond = async (id, status) => {
    setResponding(id);
    const data = await apiFetch(`/api/applications/${id}/respond`, { method:'PATCH', body:JSON.stringify({ status }) });
    if (data.success) { setApplications(prev=>prev.map(a=>a._id===id?{...a,status}:a)); onRespond(); }
    setResponding(null);
  };
  const handleRatingSuccess = () => { load(); onRespond(); };

  const appStatusConfig = {
    Accepted:  'bg-emerald-50 text-emerald-700 border border-emerald-100',
    Rejected:  'bg-red-50 text-red-700 border border-red-100',
    Withdrawn: 'bg-slate-100 text-slate-500 border border-slate-200',
    Completed: 'bg-blue-50 text-blue-700 border border-blue-100',
    Pending:   'bg-amber-50 text-amber-700 border border-amber-100',
  };

  const visibleApplications = focusedApplication
    ? applications.filter(a=>a._id===focusedApplication._id)
    : [...applications].sort(newestApplicationFirst);
  const pendingApps  = visibleApplications.filter(a=>a.status==='Pending');
  const acceptedApps = visibleApplications.filter(a=>a.status==='Accepted'||a.status==='Completed');
  const otherApps    = visibleApplications.filter(a=>a.status==='Rejected'||a.status==='Withdrawn');

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[88vh] overflow-y-auto shadow-2xl border border-slate-100">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur z-10">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{focusedApplication?'Review Application':'Applications'}</h3>
                <p className="text-sm text-slate-500 mt-0.5 font-medium">
                  {job.title}
                  {isGigDatePast&&<span className="ml-2 text-blue-600 font-semibold text-xs">• Event Passed</span>}
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"><X size={20}/></button>
            </div>
            {/* Quick counts */}
            {!loading && visibleApplications.length > 0 && (
              <div className="flex gap-3 mt-3">
                {[
                  {label:'Pending', count:pendingApps.length, color:'bg-amber-100 text-amber-700'},
                  {label:'Accepted', count:acceptedApps.length, color:'bg-emerald-100 text-emerald-700'},
                  {label:'Total', count:visibleApplications.length, color:'bg-slate-100 text-slate-700'},
                ].map(item=>(
                  <div key={item.label} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${item.color}`}>{item.count} {item.label}</div>
                ))}
              </div>
            )}
          </div>

          <div className="p-5">
            {loading ? (
              <div className="space-y-3">{[...Array(3)].map((_,i)=><Skeleton key={i} className="h-20"/>)}</div>
            ) : visibleApplications.length===0 ? (
              <div className="text-center py-14">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><Users size={24} className="text-slate-400"/></div>
                <p className="font-bold text-slate-700">No applications yet</p>
                <p className="text-sm text-slate-400 mt-1">Workers will apply soon. Share the listing to get more visibility.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Pending — shown first, most actionable */}
                {pendingApps.length>0&&(
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Needs Review ({pendingApps.length})</p>
                    <div className="space-y-3">
                      {pendingApps.map(app=>{
                        const worker  = app.workerId;
                        const profile = app.workerProfile;
                        return (
                          <div key={app._id} className="border-2 border-amber-100 bg-amber-50/30 rounded-2xl p-4 hover:border-amber-200 transition-all">
                            <div className="flex flex-col sm:flex-row justify-between gap-4">
                              {/* Worker info */}
                              <div className="flex gap-3 flex-1 min-w-0">
                                <img src={worker?.profilePicture||`https://i.pravatar.cc/150?u=${worker?._id}`} alt={worker?.fullName}
                                  className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-sm shrink-0"/>
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-900 text-sm">{worker?.fullName}</p>
                                  <p className="text-xs text-slate-500">{worker?.email}</p>
                                  {profile&&(
                                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                                      {profile.skills?.slice(0,3).map(s=><span key={s} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-xs font-medium">{s}</span>)}
                                      {profile.experienceLevel&&<span className="px-2 py-0.5 bg-violet-50 text-violet-700 border border-violet-100 rounded-lg text-xs font-medium capitalize">{profile.experienceLevel}</span>}
                                    </div>
                                  )}
                                  {profile?.ratings?.average>0&&(
                                    <div className="flex items-center gap-1 mt-1.5"><StarDisplay score={profile.ratings.average}/><span className="text-xs text-slate-400">({profile.ratings.total})</span></div>
                                  )}
                                  {app.coverNote&&<p className="text-xs text-slate-600 bg-white border border-slate-100 px-3 py-2 rounded-lg mt-2 italic">"{app.coverNote}"</p>}
                                  <p className="text-xs text-slate-400 mt-1.5">Applied {new Date(app.appliedAt).toLocaleDateString('en-IN')}</p>
                                </div>
                              </div>
                              {/* Actions */}
                              <div className="flex sm:flex-col gap-2 shrink-0">
                                <button onClick={()=>handleRespond(app._id,'Accepted')} disabled={responding===app._id}
                                  className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60">
                                  {responding===app._id?<Loader size={13} className="animate-spin"/>:<CheckSquare size={13}/>}Hire
                                </button>
                                <button onClick={()=>handleRespond(app._id,'Rejected')} disabled={responding===app._id}
                                  className="flex-1 sm:flex-none px-4 py-2 border border-red-200 text-red-600 rounded-xl font-bold text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60">
                                  {responding===app._id?<Loader size={13} className="animate-spin"/>:<XSquare size={13}/>}Pass
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Accepted / Completed */}
                {acceptedApps.length>0&&(
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Hired ({acceptedApps.length})</p>
                    <div className="space-y-3">
                      {acceptedApps.map(app=>{
                        const worker  = app.workerId;
                        const profile = app.workerProfile;
                        const alreadyRated = !!(app.workerRating?.score&&app.workerRating.score>0);
                        return (
                          <div key={app._id} className="border border-slate-100 bg-white rounded-2xl p-4 hover:border-indigo-100 transition-all">
                            <div className="flex flex-col sm:flex-row justify-between gap-4">
                              <div className="flex gap-3 flex-1 min-w-0">
                                <img src={worker?.profilePicture||`https://i.pravatar.cc/150?u=${worker?._id}`} alt={worker?.fullName}
                                  className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-100 shadow-sm shrink-0"/>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-bold text-slate-900 text-sm">{worker?.fullName}</p>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${appStatusConfig[app.status]||'bg-slate-100 text-slate-600'}`}>{app.status}</span>
                                  </div>
                                  <p className="text-xs text-slate-500">{worker?.email}</p>
                                  {profile?.skills?.length>0&&(
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                      {profile.skills.slice(0,3).map(s=><span key={s} className="px-2 py-0.5 bg-slate-50 text-slate-600 border border-slate-100 rounded-lg text-xs">{s}</span>)}
                                    </div>
                                  )}
                                  {/* Ratings */}
                                  {alreadyRated&&(
                                    <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                                      <p className="text-xs font-semibold text-emerald-700 mb-1">✓ Your rating:</p>
                                      <StarDisplay score={app.workerRating.score}/>
                                      {app.workerRating.review&&<p className="text-xs text-slate-600 mt-1 italic">"{app.workerRating.review}"</p>}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex sm:flex-col gap-2 shrink-0">
                                {app.status==='Completed'&&!alreadyRated&&(
                                  <button onClick={()=>setRatingApp(app)}
                                    className="px-4 py-2 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-colors flex items-center gap-1.5">
                                    <Star size={13}/>Rate
                                  </button>
                                )}
                                {alreadyRated&&<span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold"><CheckCircle size={12}/>Rated</span>}
                                {(app.status==='Accepted'||app.status==='Completed')&&(
                                  <button onClick={()=>setChatApp(app)}
                                    className="px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-colors flex items-center gap-1.5">
                                    <MessageSquare size={13}/>Chat
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Rejected / Withdrawn */}
                {otherApps.length>0&&(
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Declined / Withdrawn ({otherApps.length})</p>
                    <div className="space-y-2">
                      {otherApps.map(app=>{
                        const worker = app.workerId;
                        return (
                          <div key={app._id} className="border border-slate-100 rounded-xl p-3.5 flex items-center justify-between gap-3 opacity-60">
                            <div className="flex items-center gap-3 min-w-0">
                              <img src={worker?.profilePicture||`https://i.pravatar.cc/150?u=${worker?._id}`} className="w-9 h-9 rounded-full object-cover shrink-0" alt={worker?.fullName}/>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-700 text-sm truncate">{worker?.fullName}</p>
                                <p className="text-xs text-slate-400">{worker?.email}</p>
                              </div>
                            </div>
                            <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${appStatusConfig[app.status]||'bg-slate-100 text-slate-600'}`}>{app.status}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {ratingApp&&<RateWorkerModal application={ratingApp} onClose={()=>setRatingApp(null)} onSuccess={handleRatingSuccess}/>}
      {chatApp&&(
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <ChatWindow applicationId={chatApp?._id} onClose={()=>setChatApp(null)}/>
        </div>
      )}
    </>
  );
};

// ─── MAIN ORGANIZER DASHBOARD ─────────────────────────────────────────────────
const OrganizerDashboard = () => {
  const navigate = useNavigate();

  const [activeTab,           setActiveTab]           = useState('overview');
  const [sidebarOpen,         setSidebarOpen]         = useState(false);
  const [showJobModal,        setShowJobModal]        = useState(false);
  const [editingJob,          setEditingJob]          = useState(null);
  const [viewApplicationsJob, setViewApplicationsJob] = useState(null);
  const [focusedApplication,  setFocusedApplication]  = useState(null);
  const [showKycModal,        setShowKycModal]        = useState(false);

  const [dashboardData, setDashboardData] = useState(null);
  const [jobs,          setJobs]          = useState([]);
  const [hiredWorkers,  setHiredWorkers]  = useState([]);
  const [kycStatus,     setKycStatus]     = useState(localStorage.getItem('kycStatus')||'pending');

  const [loadingDash,   setLoadingDash]   = useState(true);
  const [loadingJobs,   setLoadingJobs]   = useState(true);
  const [loadingHired,  setLoadingHired]  = useState(false);
  const [deletingJobId, setDeletingJobId] = useState(null);
  const [errorMsg,      setErrorMsg]      = useState('');

  const userName  = localStorage.getItem('userName')  || 'Organiser';
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
    ['token','userRole','userId','userName','userEmail','kycStatus'].forEach(k=>localStorage.removeItem(k));
    navigate('/login');
  };

  const fetchDashboard = useCallback(async () => {
    setLoadingDash(true);
    const [dashRes, kycRes] = await Promise.all([apiFetch('/api/organizers/dashboard'), apiFetch('/api/kyc/my')]);
    if (dashRes.success) setDashboardData(dashRes.data);
    else setErrorMsg(dashRes.message||'Failed to load dashboard.');
    if (kycRes.success) { setKycStatus(kycRes.data.kycStatus); localStorage.setItem('kycStatus',kycRes.data.kycStatus); }
    setLoadingDash(false);
  }, []);

  const fetchJobs = useCallback(async () => {
    setLoadingJobs(true);
    const data = await apiFetch('/api/jobs/my');
    if (data.success) setJobs(data.data.jobs);
    else setErrorMsg(data.message||'Failed to load jobs.');
    setLoadingJobs(false);
  }, []);

  const fetchHired = useCallback(async () => {
    setLoadingHired(true);
    const data = await apiFetch('/api/organizers/hired');
    if (data.success) setHiredWorkers(data.data.hired);
    setLoadingHired(false);
  }, []);

  useEffect(() => { fetchDashboard(); fetchJobs(); }, []);
  useEffect(() => { if (activeTab==='hired') fetchHired(); }, [activeTab]);

  const handleJobSaved = (savedJob) => {
    setJobs(prev => {
      const exists = prev.find(j=>j._id===savedJob._id);
      return exists ? prev.map(j=>j._id===savedJob._id?savedJob:j) : [savedJob,...prev];
    });
    fetchDashboard();
    setEditingJob(null);
  };

  const handleCreateJobClick = async () => {
    const res = await apiFetch('/api/kyc/my');
    if (res.success) {
      setKycStatus(res.data.kycStatus);
      localStorage.setItem('kycStatus',res.data.kycStatus);
      if (res.data.kycStatus!=='verified') { setShowKycModal(true); return; }
    }
    setShowJobModal(true);
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Delete this job and all its applications?')) return;
    setDeletingJobId(jobId);
    const data = await apiFetch(`/api/jobs/${jobId}`,{method:'DELETE'});
    if (data.success) { setJobs(prev=>prev.filter(j=>j._id!==jobId)); fetchDashboard(); }
    else alert(data.message||'Failed to delete.');
    setDeletingJobId(null);
  };

  const handleToggleStatus = async (job) => {
    const newStatus = job.status==='Active'?'Paused':'Active';
    const data = await apiFetch(`/api/jobs/${job._id}`,{method:'PUT',body:JSON.stringify({status:newStatus})});
    if (data.success) { setJobs(prev=>prev.map(j=>j._id===job._id?{...j,status:newStatus}:j)); fetchDashboard(); }
  };

  const handleReviewApplication = (app) => {
    const populatedJob = typeof app.jobId === 'object' ? app.jobId : null;
    const jobId = populatedJob?._id || app.jobId;
    const loadedJob = jobs.find(j => String(j._id) === String(jobId));

    if (loadedJob) {
      setViewApplicationsJob(loadedJob);
      setFocusedApplication(app);
    } else if (populatedJob?._id) {
      setViewApplicationsJob(populatedJob);
      setFocusedApplication(app);
    } else {
      setActiveTab('applications');
    }
  };

  const closeApplicationsModal = () => {
    setViewApplicationsJob(null);
    setFocusedApplication(null);
  };

  const formatPay = (pay) => {
    if (!pay) return '—';
    return `₹${pay.amount?.toLocaleString('en-IN')}${paySuffix(pay.type) || ' fixed'}`;
  };

  const today = new Date(); today.setHours(0,0,0,0);

  const stats = dashboardData ? [
    { label:'Active Jobs',       value:String(dashboardData.stats.activeJobs),      icon:Briefcase,  color:'bg-blue-500',    trend:'+2 this week' },
    { label:'Total Jobs Posted', value:String(dashboardData.stats.totalJobsPosted), icon:TrendingUp, color:'bg-violet-500',  trend:'All time' },
    { label:'Total Hires',       value:String(dashboardData.stats.totalHires),       icon:UserCheck,  color:'bg-emerald-500', trend:'Workers hired' },
    { label:'Escrow Balance',    value:`₹${(dashboardData.stats.escrowBalance||0).toLocaleString('en-IN')}`, icon:DollarSign, color:'bg-indigo-600', trend:'Available' },
  ] : [];

  const pendingAppsCount = dashboardData?.recentApplications?.length || 0;
  const activeJobs       = jobs.filter(j=>j.status==='Active');

  const NAV_ITEMS = [
    { id:'overview',     label:'Overview',      icon:BarChart3,  badge:null },
    { id:'jobs',         label:'My Jobs',       icon:Briefcase,  badge:null },
    { id:'applications', label:'Applications',  icon:Users,      badge:pendingAppsCount>0?pendingAppsCount:null },
    { id:'hired',        label:'Hired Workers', icon:UserCheck,  badge:null },
    { id:'payments',     label:'Payments',      icon:DollarSign, badge:null },
  ];

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif" }} className="min-h-screen bg-slate-50 antialiased">

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center gap-3">
              <button onClick={()=>setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors" aria-label="Toggle menu">
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
                : <button onClick={()=>navigate('/kyc')}
                    className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                      kycStatus==='rejected'?'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                      :kycStatus==='in_progress'?'bg-amber-50 text-amber-700 border-amber-200'
                      :'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                    }`}>
                    <Shield size={11}/>
                    {kycStatus==='rejected'?'KYC Rejected':kycStatus==='in_progress'?'In Review':'Complete KYC'}
                  </button>}

              {/* Post job CTA — always visible in nav on mobile */}
              <button onClick={handleCreateJobClick}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
                <Plus size={15}/><span className="hidden sm:inline">Post Job</span>
              </button>

              <NotificationBell onNavigate={navigate}/>

              <button onClick={()=>navigate('/profile')} className="flex items-center gap-2.5 pl-3 border-l border-slate-100 hover:bg-slate-50 py-1 px-2 rounded-xl transition-colors">
                <img src={`https://i.pravatar.cc/150?u=${userEmail}`} alt="Profile" className="w-8 h-8 rounded-full ring-2 ring-slate-100"/>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-bold text-slate-900 leading-tight">{userName}</p>
                  <p className="text-xs text-indigo-600 font-semibold">Organiser</p>
                </div>
              </button>

              <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="Logout">
                <LogOut size={17}/>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {sidebarOpen&&<div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={()=>setSidebarOpen(false)}/>}

        {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
        <aside className={`${sidebarOpen?'translate-x-0':'-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-60 bg-white border-r border-slate-100 transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none`}>
          <div className="p-4 space-y-4 pt-4">
            {/* Post Job button — sidebar */}
            <button onClick={handleCreateJobClick}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 flex items-center justify-center gap-2">
              <Plus size={18}/>Create New Job
            </button>

            {/* Nav */}
            <nav className="space-y-0.5">
              {NAV_ITEMS.map(item=>(
                <button key={item.id} onClick={()=>{setActiveTab(item.id);setSidebarOpen(false);}}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeTab===item.id?'bg-indigo-50 text-indigo-700':'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}>
                  <item.icon size={17} strokeWidth={activeTab===item.id?2.5:2}/>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge&&<span className="bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">{item.badge}</span>}
                </button>
              ))}
            </nav>

            {/* Quick health card */}
            {!loadingDash && dashboardData && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Quick Stats</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {label:'Active',  val:dashboardData.stats.activeJobs,    color:'text-blue-600'},
                    {label:'Hires',   val:dashboardData.stats.totalHires,     color:'text-emerald-600'},
                  ].map(item=>(
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

          {/* Error */}
          {errorMsg&&(
            <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-3.5 flex gap-3 items-center">
              <AlertCircle className="text-red-500 shrink-0" size={17}/>
              <p className="text-red-700 text-sm flex-1">{errorMsg}</p>
              <button onClick={()=>setErrorMsg('')} className="text-red-400 hover:text-red-600"><X size={15}/></button>
            </div>
          )}

          <KycBanner kycStatus={kycStatus} onNavigate={()=>navigate('/kyc')}/>

          {/* ══ OVERVIEW ══ */}
          {activeTab==='overview' && (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">Dashboard</h1>
                  <p className="text-slate-500 text-sm mt-0.5">Welcome back, {userName} 👋</p>
                </div>
                <button onClick={()=>{fetchDashboard();fetchJobs();}}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-sm font-semibold text-slate-600 transition-colors">
                  <RefreshCw size={14}/>Refresh
                </button>
              </div>

              {/* Stats grid */}
              {loadingDash
                ? <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[...Array(4)].map((_,i)=><Skeleton key={i} className="h-28"/>)}</div>
                : <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {stats.map((stat,i)=>(
                      <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                        <div className={`w-9 h-9 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                          <stat.icon size={18} className="text-white"/>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">{stat.label}</p>
                        <p className="text-xl font-extrabold text-slate-900 mt-0.5">{stat.value}</p>
                        <p className="text-xs text-slate-400 mt-1">{stat.trend}</p>
                      </div>
                    ))}
                  </div>}

              {/* Two-column below */}
              <div className="grid lg:grid-cols-2 gap-4">

                {/* Pending Applications — most urgent */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <Users size={16} className="text-indigo-500"/>Pending Applications
                      {pendingAppsCount>0&&<span className="bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">{pendingAppsCount}</span>}
                    </h3>
                    <button onClick={()=>setActiveTab('applications')} className="text-xs text-indigo-600 font-semibold hover:underline">View all</button>
                  </div>
                  {loadingDash
                    ? <div className="space-y-2">{[...Array(3)].map((_,i)=><Skeleton key={i} className="h-14"/>)}</div>
                    : (dashboardData?.recentApplications||[]).length===0
                      ? <div className="text-center py-8">
                          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3"><Users size={20} className="text-slate-400"/></div>
                          <p className="text-sm text-slate-500 font-medium">No pending applications</p>
                          <p className="text-xs text-slate-400 mt-1">Post a job to start receiving applicants</p>
                        </div>
                      : <div className="space-y-2.5">
                          {[...dashboardData.recentApplications].sort(newestApplicationFirst).map(app=>{
                            const worker = app.workerId || {};
                            const profile = app.workerProfile;
                            const applicantName = worker.fullName || worker.email || 'Applicant';
                            const appliedDate = app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-IN') : null;
                            return (
                              <div key={app._id} className="flex items-center justify-between gap-3 p-3.5 bg-amber-50 border border-amber-100 rounded-xl hover:bg-amber-100/60 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                  <img src={worker.profilePicture||`https://i.pravatar.cc/150?u=${worker._id||app._id}`}
                                    alt={applicantName} className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-white"/>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <p className="font-bold text-slate-900 text-sm truncate">{applicantName}</p>
                                      {profile?.ratings?.average>0&&(
                                        <span className="shrink-0 text-[11px] font-bold text-amber-600">{profile.ratings.average.toFixed(1)}★</span>
                                      )}
                                    </div>
                                    <p className="text-xs text-slate-600 truncate">{app.jobId?.title||'Untitled job'}</p>
                                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400">
                                      {appliedDate&&<span>Applied {appliedDate}</span>}
                                      {profile?.skills?.slice(0,2).map(skill=>(
                                        <span key={skill} className="px-1.5 py-0.5 bg-white border border-amber-100 rounded-md text-slate-600">{skill}</span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <button onClick={()=>handleReviewApplication(app)}
                                  className="shrink-0 px-3.5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors">
                                  Review
                                </button>
                              </div>
                            );
                          })}
                        </div>}
                </div>

                {/* Active Jobs / Upcoming Events */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2"><Calendar size={16} className="text-violet-500"/>Active Jobs</h3>
                    <button onClick={()=>setActiveTab('jobs')} className="text-xs text-indigo-600 font-semibold hover:underline">View all</button>
                  </div>
                  {loadingJobs
                    ? <div className="space-y-2">{[...Array(3)].map((_,i)=><Skeleton key={i} className="h-14"/>)}</div>
                    : activeJobs.length===0
                      ? <div className="text-center py-8">
                          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3"><Briefcase size={20} className="text-slate-400"/></div>
                          <p className="text-sm text-slate-500 font-medium">No active jobs</p>
                          <button onClick={handleCreateJobClick} className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors">Post First Job</button>
                        </div>
                      : <div className="space-y-2">
                          {activeJobs.slice(0,4).map(job=>(
                            <div key={job._id} onClick={()=>setViewApplicationsJob(job)}
                              className="p-3 border border-slate-100 rounded-xl hover:bg-slate-50 hover:border-indigo-100 transition-all cursor-pointer group">
                              <div className="flex justify-between items-start gap-2 mb-1.5">
                                <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-700 transition-colors truncate flex-1">{job.title}</h4>
                                <span className="shrink-0 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">{job.applicantCount} applied</span>
                              </div>
                              <div className="flex gap-3 text-xs text-slate-400">
                                <span className="flex items-center gap-1"><Calendar size={11}/>{new Date(job.date).toLocaleDateString('en-IN')}</span>
                                <span className="flex items-center gap-1"><MapPin size={11}/>{job.location?.city}</span>
                                <span className="flex items-center gap-1"><Users size={11}/>{job.slotsFilled}/{job.slotsTotal} filled</span>
                              </div>
                            </div>
                          ))}
                        </div>}
                </div>
              </div>

              {/* Pending KYC CTA */}
              {kycStatus!=='verified'&&(
                <div className="bg-indigo-600 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-500/50 rounded-2xl flex items-center justify-center shrink-0">
                    <Shield className="text-white" size={22}/>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white">Complete KYC to unlock all features</p>
                    <p className="text-sm text-indigo-200 mt-0.5">Verify your identity to post jobs and access escrow payments</p>
                  </div>
                  <button onClick={()=>navigate('/kyc')} className="shrink-0 px-5 py-2.5 bg-white text-indigo-700 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors">
                    Verify Now →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ══ MY JOBS ══ */}
          {activeTab==='jobs' && (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">My Jobs</h1>
                  <p className="text-slate-500 text-sm mt-0.5">{jobs.length} job{jobs.length!==1?'s':''} posted</p>
                </div>
                <button onClick={handleCreateJobClick}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
                  <Plus size={16}/>New Job
                </button>
              </div>

              {loadingJobs
                ? <div className="space-y-3">{[...Array(3)].map((_,i)=><Skeleton key={i} className="h-40"/>)}</div>
                : jobs.length===0
                  ? <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><Briefcase size={28} className="text-slate-400"/></div>
                      <h3 className="text-lg font-bold text-slate-700 mb-2">No jobs posted yet</h3>
                      <p className="text-slate-400 text-sm mb-5">Post your first job to start finding qualified volunteers</p>
                      <button onClick={handleCreateJobClick} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors">Post Your First Job</button>
                    </div>
                  : <div className="space-y-3">
                      {jobs.map(job=>{
                        const isCompleted = isJobCompleted(job);
                        const slotsPercent = job.slotsTotal > 0 ? Math.round((job.slotsFilled/job.slotsTotal)*100) : 0;
                        return (
                          <div key={job._id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md hover:border-indigo-100 transition-all duration-200">
                            {/* Top section */}
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  {job.urgent&&<span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-full text-xs font-bold"><Zap size={10}/>Urgent</span>}
                                  <JobStatusBadge status={job.status} isCompleted={isCompleted}/>
                                </div>
                                <h3 className="text-base font-bold text-slate-900 truncate">{job.title}</h3>
                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                  {job.requiredSkills?.slice(0,3).map(s=><span key={s} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-xs font-medium">{s}</span>)}
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-lg font-extrabold text-indigo-600">{formatPay(job.pay)}</p>
                                <p className="text-xs text-slate-400">{job.slotsTotal} workers needed</p>
                              </div>
                            </div>

                            {/* Meta row */}
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mb-4">
                              <span className="flex items-center gap-1"><MapPin size={11} className="text-slate-400"/>{job.location?.city}</span>
                              <span className="flex items-center gap-1"><Calendar size={11} className="text-slate-400"/>{new Date(job.date).toLocaleDateString('en-IN')} • {job.time}</span>
                              <span className="flex items-center gap-1 font-semibold text-slate-600"><Users size={11} className="text-slate-400"/>{job.applicantCount} applied</span>
                            </div>

                            {/* Slot progress bar */}
                            <div className="mb-4">
                              <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>{job.slotsFilled} of {job.slotsTotal} slots filled</span>
                                <span className="font-semibold">{slotsPercent}%</span>
                              </div>
                              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-1.5 rounded-full transition-all duration-500 ${slotsPercent===100?'bg-emerald-500':'bg-indigo-500'}`} style={{width:`${slotsPercent}%`}}/>
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-wrap gap-2">
                              {/* Primary */}
                              <button onClick={()=>setViewApplicationsJob(job)}
                                className={`flex-1 sm:flex-none px-4 py-2 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1.5 ${
                                  isCompleted?'bg-blue-600 hover:bg-blue-700':'bg-indigo-600 hover:bg-indigo-700'
                                }`}>
                                <Eye size={14}/>{isCompleted?'View & Rate':`Applications (${job.applicantCount})`}
                              </button>

                              {/* Secondary — only for non-completed */}
                              {!isCompleted&&(
                                <>
                                  <button onClick={()=>{setEditingJob(job);setShowJobModal(true);}}
                                    className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors flex items-center gap-1.5">
                                    <Edit size={14}/>Edit
                                  </button>
                                  <button onClick={()=>handleToggleStatus(job)}
                                    className={`px-3.5 py-2 rounded-xl font-semibold text-sm border transition-colors flex items-center gap-1.5 ${
                                      job.status==='Active'?'border-amber-200 text-amber-600 hover:bg-amber-50':'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                                    }`}>
                                    {job.status==='Active'?'⏸ Pause':'▶ Activate'}
                                  </button>
                                </>
                              )}

                              {/* Delete — always visible, less prominent */}
                              <button onClick={()=>handleDeleteJob(job._id)} disabled={deletingJobId===job._id}
                                className="px-3.5 py-2 border border-red-100 text-red-500 rounded-xl font-semibold text-sm hover:bg-red-50 transition-colors flex items-center gap-1.5 disabled:opacity-50 ml-auto">
                                {deletingJobId===job._id?<Loader size={14} className="animate-spin"/>:<Trash2 size={14}/>}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>}
            </div>
          )}

          {/* ══ APPLICATIONS ══ */}
          {activeTab==='applications' && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Applications</h1>
                <p className="text-slate-500 text-sm mt-0.5">Review applications across all your jobs</p>
              </div>
              {loadingJobs
                ? <div className="space-y-3">{[...Array(3)].map((_,i)=><Skeleton key={i} className="h-20"/>)}</div>
                : jobs.length===0
                  ? <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><Users size={24} className="text-slate-400"/></div>
                      <h3 className="text-base font-bold text-slate-700 mb-1">No jobs yet</h3>
                      <p className="text-slate-400 text-sm">Post jobs first to receive applications</p>
                    </div>
                  : <div className="space-y-2.5">
                      {jobs.map(job=>{
                        const isCompleted = isJobCompleted(job);
                        const hasPending = job.applicantCount > 0;
                        return (
                          <div key={job._id}
                            className={`bg-white rounded-2xl border transition-all ${hasPending&&!isCompleted?'border-amber-100 hover:border-amber-200':'border-slate-100 hover:border-slate-200'} hover:shadow-sm`}>
                            <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <h3 className="font-bold text-slate-900 text-sm truncate">{job.title}</h3>
                                  <JobStatusBadge status={job.status} isCompleted={isCompleted}/>
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                                  <span className="flex items-center gap-1"><MapPin size={11}/>{job.location?.city}</span>
                                  <span className="flex items-center gap-1"><Calendar size={11}/>{new Date(job.date).toLocaleDateString('en-IN')}</span>
                                  <span className={`flex items-center gap-1 font-semibold ${job.applicantCount>0?'text-indigo-600':'text-slate-400'}`}>
                                    <Users size={11}/>{job.applicantCount} applicant{job.applicantCount!==1?'s':''}
                                  </span>
                                </div>
                              </div>
                              <button onClick={()=>setViewApplicationsJob(job)}
                                className={`shrink-0 px-4 py-2 text-white rounded-xl font-bold text-sm transition-colors flex items-center gap-1.5 ${
                                  isCompleted?'bg-blue-600 hover:bg-blue-700':'bg-indigo-600 hover:bg-indigo-700'
                                }`}>
                                <Eye size={14}/>{isCompleted?'View & Rate':'View Applicants'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>}
            </div>
          )}

          {/* ══ HIRED WORKERS ══ */}
          {activeTab==='hired' && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Hired Workers</h1>
                <p className="text-slate-500 text-sm mt-0.5">{hiredWorkers.length} worker{hiredWorkers.length!==1?'s':''} hired</p>
              </div>
              {loadingHired
                ? <div className="space-y-3">{[...Array(4)].map((_,i)=><Skeleton key={i} className="h-16"/>)}</div>
                : hiredWorkers.length===0
                  ? <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><UserCheck size={24} className="text-slate-400"/></div>
                      <h3 className="text-base font-bold text-slate-700 mb-1">No hired workers yet</h3>
                      <p className="text-slate-400 text-sm">Accept applications to hire workers</p>
                    </div>
                  : (
                      <>
                        {/* Mobile: cards */}
                        <div className="sm:hidden space-y-3">
                          {hiredWorkers.map(hire=>(
                            <div key={hire._id} className="bg-white rounded-2xl border border-slate-100 p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <img src={hire.workerId?.profilePicture||`https://i.pravatar.cc/150?u=${hire.workerId?._id}`}
                                  alt={hire.workerId?.fullName} className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"/>
                                <div>
                                  <p className="font-bold text-slate-900 text-sm">{hire.workerId?.fullName}</p>
                                  <p className="text-xs text-slate-400">{hire.workerId?.phone}</p>
                                </div>
                                <span className={`ml-auto px-2.5 py-1 rounded-full text-xs font-semibold ${hire.status==='Completed'?'bg-blue-50 text-blue-700 border border-blue-100':'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>{hire.status}</span>
                              </div>
                              <div className="space-y-1.5 text-xs text-slate-500">
                                <p className="font-semibold text-slate-700">{hire.jobId?.title}</p>
                                <div className="flex gap-3">
                                  <span>{hire.jobId?.date?new Date(hire.jobId.date).toLocaleDateString('en-IN'):'—'}</span>
                                  <span className="font-bold text-slate-900">{hire.jobId?.pay?`₹${hire.jobId.pay.amount?.toLocaleString('en-IN')}${paySuffix(hire.jobId.pay.type)}`:''}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Desktop: table */}
                        <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                              <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                  {['Worker','Job','Date','Pay','Status'].map(h=>(
                                    <th key={h} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {hiredWorkers.map(hire=>(
                                  <tr key={hire._id} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                                    <td className="px-4 py-3.5">
                                      <div className="flex items-center gap-3">
                                        <img src={hire.workerId?.profilePicture||`https://i.pravatar.cc/150?u=${hire.workerId?._id}`}
                                          alt={hire.workerId?.fullName} className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100"/>
                                        <div>
                                          <p className="font-semibold text-slate-900 text-sm">{hire.workerId?.fullName}</p>
                                          <p className="text-xs text-slate-400">{hire.workerId?.phone}</p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-slate-700 font-medium text-sm max-w-[160px] truncate">{hire.jobId?.title}</td>
                                    <td className="px-4 py-3.5 text-slate-500 text-xs">{hire.jobId?.date?new Date(hire.jobId.date).toLocaleDateString('en-IN'):'—'}</td>
                                    <td className="px-4 py-3.5 font-bold text-slate-900 text-sm">{hire.jobId?.pay?`₹${hire.jobId.pay.amount?.toLocaleString('en-IN')}${paySuffix(hire.jobId.pay.type)}`:''}</td>
                                    <td className="px-4 py-3.5">
                                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${hire.status==='Completed'?'bg-blue-50 text-blue-700 border border-blue-100':'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>{hire.status}</span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </>
                    )}
            </div>
          )}

          {/* ══ PAYMENTS ══ */}
          {activeTab==='payments' && (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">Payments</h1>
                  <p className="text-slate-500 text-sm mt-0.5">Manage your escrow and payment history</p>
                </div>
                <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-sm font-semibold text-slate-600 transition-colors">
                  <Download size={14}/>Statement
                </button>
              </div>

              {/* Balance hero */}
              <div className="bg-indigo-600 rounded-2xl p-6 text-white">
                <p className="text-indigo-200 text-sm font-medium">Escrow Balance</p>
                <p className="text-4xl font-extrabold mt-1 mb-4">₹{(dashboardData?.stats?.escrowBalance||0).toLocaleString('en-IN')}</p>
                <div className="flex flex-wrap gap-6">
                  {[
                    {label:'Jobs Posted', val:dashboardData?.stats?.totalJobsPosted||0},
                    {label:'Total Hires',  val:dashboardData?.stats?.totalHires||0},
                  ].map(item=>(
                    <div key={item.label} className="bg-indigo-500/40 px-4 py-2.5 rounded-xl backdrop-blur-sm">
                      <p className="text-xl font-extrabold">{item.val}</p>
                      <p className="text-xs text-indigo-200 mt-0.5">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment history placeholder */}
              <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><DollarSign size={24} className="text-slate-400"/></div>
                <h3 className="font-bold text-slate-700 mb-1">Payment history coming soon</h3>
                <p className="text-sm text-slate-400">Full escrow & transaction management will appear here</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── MODALS ─────────────────────────────────────────────────────────── */}
      {showJobModal&&(
        <JobModal onClose={()=>{setShowJobModal(false);setEditingJob(null);}} onCreate={handleJobSaved} editJob={editingJob} kycStatus={kycStatus}/>
      )}
      {viewApplicationsJob&&(
        <ApplicationsModal
          job={viewApplicationsJob}
          focusedApplication={focusedApplication}
          onClose={closeApplicationsModal}
          onRespond={()=>{fetchDashboard();fetchJobs();}}
        />
      )}
      {showKycModal&&(
        <KycRequiredModal kycStatus={kycStatus} onClose={()=>setShowKycModal(false)}/>
      )}
    </div>
  );
};

export default OrganizerDashboard;

