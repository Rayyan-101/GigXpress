import React, { useState, useEffect, useCallback } from 'react';
import {
  Briefcase, Plus, Users, Clock, DollarSign, CheckCircle,
  Star, MapPin, Calendar, Edit, Trash2, Eye, UserCheck,
  TrendingUp, AlertCircle, Download, BarChart3, Bell,
  Menu, X, Loader, RefreshCw, CheckSquare, XSquare,
  LogOut, Shield, XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─── API ──────────────────────────────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiFetch = async (path, options = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include', // 🔥 MUST ADD
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return res.json();
};



// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const SKILL_OPTIONS = [
  'Event Management','Hospitality','Marketing','Technical Support',
  'AV Setup','Crowd Management','Registration Desk','Photography','Decoration',
];
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
          {isRejected   ? 'KYC Rejected'            :
           isInProgress ? 'KYC Under Review'        :
                          'KYC Required to Post Jobs'}
        </h3>
        <p className="text-gray-500 text-sm mb-6">
          {isRejected
            ? 'Your KYC was rejected. Please re-submit with clearer, valid documents.'
            : isInProgress
            ? 'Your documents are being reviewed (24–48 hrs). Job posting unlocks once verified.'
            : 'Complete KYC verification to start posting jobs and hiring volunteers.'}
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
    pending:     { bg: 'bg-amber-50 border-amber-200', Icon: AlertCircle, iconCls: 'text-amber-600', text: 'Complete KYC verification to post jobs and hire workers.',     btn: 'Complete KYC',  btnCls: 'bg-amber-600 hover:bg-amber-700' },
    in_progress: { bg: 'bg-blue-50 border-blue-200',   Icon: Clock,       iconCls: 'text-blue-600',  text: 'KYC documents are under review. Job posting unlocks once approved.', btn: null,          btnCls: '' },
    rejected:    { bg: 'bg-red-50 border-red-200',     Icon: XCircle,     iconCls: 'text-red-600',   text: 'KYC rejected. Re-submit your documents to start posting jobs.',  btn: 'Re-submit KYC', btnCls: 'bg-red-600 hover:bg-red-700' },
  };
  const cfg = cfgs[kycStatus];
  if (!cfg) return null;
  const { Icon } = cfg;

  return (
    <div className={`mb-6 border rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 ${cfg.bg}`}>
      <Icon className={`flex-shrink-0 ${cfg.iconCls}`} size={20} />
      <p className="text-sm text-gray-700 flex-1 font-medium">{cfg.text}</p>
      {cfg.btn && (
        <button onClick={onNavigate} className={`flex-shrink-0 px-4 py-2 ${cfg.btnCls} text-white rounded-lg text-sm font-bold transition-all`}>
          {cfg.btn}
        </button>
      )}
    </div>
  );
};

// ─── CREATE / EDIT JOB MODAL ──────────────────────────────────────────────────
const JobModal = ({ onClose, onCreate, editJob = null, kycStatus }) => {
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
    payType:        editJob?.pay?.type      || 'per_day',
    category:       editJob?.category       || 'Other',
    description:    editJob?.description    || '',
    requirements:   editJob?.requirements   || '',
    requiredSkills: editJob?.requiredSkills || [],
    urgent:         editJob?.urgent         || false,
  });

  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [showKycModal, setShowKycModal] = useState(false);
  const [user, setUser] = useState(null);
const [loadingUser, setLoadingUser] = useState(true);

useEffect(() => {
  const fetchUser = async () => {
    try {
      const data = await apiFetch('/api/auth/me');

      if (data.success) {
        setUser(data.user);
      } else {
        navigate('/login');
      }
    } catch (err) {
      console.error(err);
      navigate('/login');
    } finally {
      setLoadingUser(false);
    }
  };

  fetchUser();
}, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleSkill = (s) =>
    setForm(p => ({
      ...p,
      requiredSkills: p.requiredSkills.includes(s)
        ? p.requiredSkills.filter(x => x !== s)
        : [...p.requiredSkills, s],
    }));

  const handleSubmit = async () => {
    // Client-side KYC gate
    const res = await apiFetch('/api/kyc/my');
    console.log("KYC RESPONSE:", res);
if (!res.success || res.data.kycStatus !== 'verified') {
  setShowKycModal(true);
  return;
}

    if (!form.title || !form.location || !form.date || !form.time || !form.slotsTotal || !form.pay) {
      setError('Please fill all required fields (Title, Location, Date, Time, Workers, Pay)');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      title: form.title.trim(), location: form.location.trim(), date: form.date, time: form.time,
      duration: form.duration, slotsTotal: Number(form.slotsTotal),
      pay: { amount: Number(form.pay), type: form.payType },
      category: form.category, description: form.description.trim(),
      requirements: form.requirements.trim(), requiredSkills: form.requiredSkills, urgent: form.urgent,
    };

    try {
      const data = isEdit
        ? await apiFetch(`/api/jobs/${editJob._id}`, { method: 'PUT', body: JSON.stringify(payload) })
        : await apiFetch('/api/jobs', { method: 'POST', body: JSON.stringify(payload) });

      if (data.success) { onCreate(data.data.job); onClose(); }
      else if (data.kycRequired) { setShowKycModal(true); }
      else setError(data.message || 'Failed to save job. Please try again.');
    } catch {
      setError('Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-6 border-b sticky top-0 bg-white/95 backdrop-blur z-10 flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Job' : 'Create New Job'}</h3>
            <button onClick={onClose} disabled={loading} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2 items-start">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title *</label>
              <input type="text" name="title" value={form.title} onChange={handleChange} disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g., Wedding Event Staff Required" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">City / Location *</label>
                <input type="text" name="location" value={form.location} onChange={handleChange} disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Pune, Koregaon Park" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Event Date *</label>
                <input type="date" name="date" value={form.date} onChange={handleChange} disabled={loading}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time *</label>
                <input type="time" name="time" value={form.time} onChange={handleChange} disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                <select name="duration" value={form.duration} onChange={handleChange} disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                  {['Full Day','Half Day','2 Hours','4 Hours','6 Hours','8 Hours'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Workers Needed *</label>
                <input type="number" name="slotsTotal" value={form.slotsTotal} onChange={handleChange} disabled={loading} min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="5" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pay per Worker (₹) *</label>
                <div className="flex gap-2">
                  <input type="number" name="pay" value={form.pay} onChange={handleChange} disabled={loading} min="0"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="1500" />
                  <select name="payType" value={form.payType} onChange={handleChange} disabled={loading}
                    className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                    <option value="per_day">/day</option>
                    <option value="per_hour">/hr</option>
                    <option value="fixed">fixed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select name="category" value={form.category} onChange={handleChange} disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-200 rounded-lg w-full hover:bg-gray-50">
                  <input type="checkbox" name="urgent" checked={form.urgent} onChange={handleChange} disabled={loading} className="w-5 h-5 accent-indigo-600" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Mark as Urgent</p>
                    <p className="text-xs text-gray-500">Shown with priority badge</p>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Required Skills</label>
              <div className="flex flex-wrap gap-2">
                {SKILL_OPTIONS.map(s => (
                  <button key={s} type="button" onClick={() => toggleSkill(s)} disabled={loading}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      form.requiredSkills.includes(s) ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
              {form.requiredSkills.length > 0 && (
                <p className="text-xs text-indigo-600 mt-2">✓ {form.requiredSkills.length} skill(s) selected</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Job Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} disabled={loading} rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Describe responsibilities and what workers will be doing..." />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Special Requirements</label>
              <textarea name="requirements" value={form.requirements} onChange={handleChange} disabled={loading} rows="2"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g., Formal dress code, must have own camera..." />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3">
              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Escrow Payment Required</p>
                <p>Total budget: ₹{form.pay && form.slotsTotal ? Number(form.pay) * Number(form.slotsTotal) : '—'} must be deposited before workers are confirmed.</p>
              </div>
            </div>
          </div>

          <div className="p-6 border-t bg-gray-50 flex gap-3 justify-end sticky bottom-0">
            <button onClick={onClose} disabled={loading}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-white transition-all active:scale-95">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2">
              {loading ? <><Loader size={18} className="animate-spin" /> Saving...</> : isEdit ? 'Save Changes' : 'Publish Job'}
            </button>
          </div>
        </div>
      </div>

      {showKycModal && (
        <KycRequiredModal kycStatus={kycStatus} onClose={() => setShowKycModal(false)} />
      )}
    </>
  );
};

// ─── APPLICATIONS MODAL ───────────────────────────────────────────────────────
const ApplicationsModal = ({ job, onClose, onRespond }) => {
  const [applications, setApplications] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [responding,   setResponding]   = useState(null);

  useEffect(() => {
    apiFetch(`/api/applications/job/${job._id}`).then(data => {
      if (data.success) setApplications(data.data.applications);
      setLoading(false);
    });
  }, [job._id]);

  const handleRespond = async (id, status) => {
    setResponding(id);
    const data = await apiFetch(`/api/applications/${id}/respond`, {
      method: 'PATCH', body: JSON.stringify({ status }),
    });
    if (data.success) {
      setApplications(prev => prev.map(a => a._id === id ? { ...a, status } : a));
      onRespond();
    }
    setResponding(null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b sticky top-0 bg-white/95 backdrop-blur z-10 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Applications</h3>
            <p className="text-sm text-gray-500 mt-0.5">{job.title}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full">
            <X size={22} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12"><Loader className="animate-spin text-indigo-600" size={32} /></div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No applications yet</p>
              <p className="text-sm text-gray-400 mt-1">Workers will apply soon.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map(app => {
                const worker  = app.workerId;
                const profile = app.workerProfile;
                return (
                  <div key={app._id} className="border border-gray-100 rounded-xl p-5 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex gap-4">
                        <img src={worker?.profilePicture || `https://i.pravatar.cc/150?u=${worker?._id}`}
                          alt={worker?.fullName} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
                        <div>
                          <p className="font-bold text-gray-900">{worker?.fullName}</p>
                          <p className="text-sm text-gray-500">{worker?.email}</p>
                          {profile && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {profile.skills?.slice(0, 3).map(s => (
                                <span key={s} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">{s}</span>
                              ))}
                              {profile.experienceLevel && (
                                <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-medium capitalize">{profile.experienceLevel}</span>
                              )}
                            </div>
                          )}
                          {profile?.ratings?.average > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star size={13} className="text-amber-400 fill-current" />
                              <span className="text-sm font-semibold text-gray-700">{profile.ratings.average}</span>
                              <span className="text-xs text-gray-400">({profile.ratings.total} ratings)</span>
                            </div>
                          )}
                          {app.coverNote && (
                            <p className="text-sm text-gray-600 mt-2 italic bg-gray-50 px-3 py-2 rounded-lg">"{app.coverNote}"</p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">Applied {new Date(app.appliedAt).toLocaleDateString('en-IN')}</p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col gap-2 items-start sm:items-end">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          app.status === 'Accepted'  ? 'bg-green-100 text-green-700'  :
                          app.status === 'Rejected'  ? 'bg-red-100 text-red-700'      :
                          app.status === 'Withdrawn' ? 'bg-gray-100 text-gray-600'   :
                          'bg-amber-100 text-amber-700'
                        }`}>{app.status}</span>

                        {app.status === 'Pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleRespond(app._id, 'Accepted')} disabled={responding === app._id}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 transition-all flex items-center gap-1 disabled:opacity-60">
                              {responding === app._id ? <Loader size={14} className="animate-spin" /> : <CheckSquare size={14} />} Hire
                            </button>
                            <button onClick={() => handleRespond(app._id, 'Rejected')} disabled={responding === app._id}
                              className="px-4 py-2 border border-red-200 text-red-600 rounded-lg font-semibold text-sm hover:bg-red-50 transition-all flex items-center gap-1 disabled:opacity-60">
                              {responding === app._id ? <Loader size={14} className="animate-spin" /> : <XSquare size={14} />} Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN ORGANISER DASHBOARD ─────────────────────────────────────────────────
const OrganizerDashboard = () => {
  const navigate = useNavigate();

  const [activeTab,           setActiveTab]           = useState('overview');
  const [sidebarOpen,         setSidebarOpen]         = useState(false);
  const [showJobModal,        setShowJobModal]        = useState(false);
  const [editingJob,          setEditingJob]          = useState(null);
  const [viewApplicationsJob, setViewApplicationsJob] = useState(null);
  const [showKycModal,        setShowKycModal]        = useState(false);

  const [dashboardData, setDashboardData] = useState(null);
  const [jobs,          setJobs]          = useState([]);
  const [hiredWorkers,  setHiredWorkers]  = useState([]);
  const [kycStatus,     setKycStatus]     = useState('pending');

  const [loadingDash,   setLoadingDash]   = useState(true);
  const [loadingJobs,   setLoadingJobs]   = useState(true);
  const [loadingHired,  setLoadingHired]  = useState(false);
  const [deletingJobId, setDeletingJobId] = useState(null);
  const [errorMsg,      setErrorMsg]      = useState('');

  const userName  = localStorage.getItem('userName')  || 'Organiser';
  const userEmail = localStorage.getItem('userEmail') || '';

  console.log("Stored userName:", localStorage.getItem("userName"));
  const handleLogout = () => {
    ['token','userRole','userId','userName','userEmail','kycStatus'].forEach(k => localStorage.removeItem(k));
    navigate('/login');
  };

  // Fetch dashboard stats + KYC status together
  const fetchDashboard = useCallback(async () => {
    setLoadingDash(true);
    const [dashRes, kycRes] = await Promise.all([
      apiFetch('/api/organizers/dashboard'),
      apiFetch('/api/kyc/my'),
    ]);
    if (dashRes.success) setDashboardData(dashRes.data);
    else setErrorMsg(dashRes.message || 'Failed to load dashboard.');
    if (kycRes.success) {
      setKycStatus(kycRes.data.kycStatus);
    }
    setLoadingDash(false);
  }, []);

  const fetchJobs = useCallback(async () => {
    setLoadingJobs(true);
    const data = await apiFetch('/api/jobs/my');
    if (data.success) setJobs(data.data.jobs);
    else setErrorMsg(data.message || 'Failed to load jobs.');
    setLoadingJobs(false);
  }, []);

  const fetchHired = useCallback(async () => {
    setLoadingHired(true);
    const data = await apiFetch('/api/organizers/hired');
    if (data.success) setHiredWorkers(data.data.hired);
    setLoadingHired(false);
  }, []);

  useEffect(() => { fetchDashboard(); fetchJobs(); }, []);
  useEffect(() => { if (activeTab === 'hired') fetchHired(); }, [activeTab]);

  const handleJobSaved = (savedJob) => {
    setJobs(prev => {
      const exists = prev.find(j => j._id === savedJob._id);
      return exists ? prev.map(j => j._id === savedJob._id ? savedJob : j) : [savedJob, ...prev];
    });
    fetchDashboard();
    setEditingJob(null);
  };

  // Check KYC before opening job modal
  const handleCreateJobClick = async () => {
  const res = await apiFetch('/api/kyc/my');

  if (res.success) {
    setKycStatus(res.data.kycStatus);

    if (res.data.kycStatus !== 'verified') {
      setShowKycModal(true);
      return;
    }
  }

  setShowJobModal(true);
};

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Delete this job and all its applications?')) return;
    setDeletingJobId(jobId);
    const data = await apiFetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
    if (data.success) { setJobs(prev => prev.filter(j => j._id !== jobId)); fetchDashboard(); }
    else alert(data.message || 'Failed to delete.');
    setDeletingJobId(null);
  };

  const handleToggleStatus = async (job) => {
    const newStatus = job.status === 'Active' ? 'Paused' : 'Active';
    const data = await apiFetch(`/api/jobs/${job._id}`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) });
    if (data.success) { setJobs(prev => prev.map(j => j._id === job._id ? { ...j, status: newStatus } : j)); fetchDashboard(); }
  };

  // Helpers
  const formatPay = (pay) => {
    if (!pay) return '—';
    return `₹${pay.amount?.toLocaleString('en-IN')}${pay.type==='per_day'?'/day':pay.type==='per_hour'?'/hr':' fixed'}`;
  };

  const statusStyle = s => ({
    Active:    'bg-green-100 text-green-700',
    Paused:    'bg-amber-100 text-amber-700',
    Completed: 'bg-blue-100 text-blue-700',
    Cancelled: 'bg-red-100 text-red-700',
  }[s] || 'bg-gray-100 text-gray-700');

  const stats = dashboardData ? [
    { label: 'Active Jobs',       value: String(dashboardData.stats.activeJobs),       icon: Briefcase,  color: 'from-blue-500 to-blue-600'    },
    { label: 'Total Jobs Posted', value: String(dashboardData.stats.totalJobsPosted),  icon: TrendingUp, color: 'from-purple-500 to-purple-600' },
    { label: 'Total Hires',       value: String(dashboardData.stats.totalHires),       icon: UserCheck,  color: 'from-green-500 to-green-600'   },
    { label: 'Escrow Balance',    value: `₹${(dashboardData.stats.escrowBalance||0).toLocaleString('en-IN')}`, icon: DollarSign, color: 'from-indigo-500 to-indigo-600' },
  ] : [];

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased text-gray-900">

      {/* NAVBAR */}
      <nav className="bg-white/90 backdrop-blur-md border-b sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                <Menu size={24} />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Briefcase className="text-white" size={20} />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">GigXpress</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* KYC status pill */}
              {kycStatus === 'verified'
                ? <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                    <CheckCircle size={12} /> KYC Verified
                  </span>
                : <button onClick={() => navigate('/kyc')}
                    className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                      kycStatus === 'rejected'    ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' :
                      kycStatus === 'in_progress' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                    'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                    }`}>
                    <Shield size={12} />
                    {kycStatus === 'rejected' ? 'KYC Rejected' : kycStatus === 'in_progress' ? 'KYC Pending' : 'Complete KYC'}
                  </button>
              }

              <button className="relative p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                <Bell size={20} />
                {(dashboardData?.recentApplications?.length || 0) > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                )}
              </button>

              {/* Profile avatar → /profile page */}
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 pl-3 border-l hover:bg-gray-50 p-1 rounded-xl transition-colors cursor-pointer">
                <img src={`https://i.pravatar.cc/150?u=${userEmail}`} alt="Profile"
                  className="w-9 h-9 rounded-full ring-2 ring-indigo-100" />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-bold leading-tight">{userName}</p>
                  <p className="text-xs text-indigo-600 font-medium">Organiser</p>
                </div>
              </button>
              
              <button onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* SIDEBAR */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r transition-transform duration-300 ease-in-out shadow-sm`}>
          <div className="p-5 space-y-5 pt-4">
            <button
              onClick={handleCreateJobClick}
              className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
              <Plus size={20} /> Create New Job
            </button>

            <nav className="space-y-1">
              {[
                { id: 'overview',     label: 'Overview',      icon: BarChart3  },
                { id: 'jobs',         label: 'My Jobs',       icon: Briefcase  },
                { id: 'applications', label: 'Applications',  icon: Users      },
                { id: 'hired',        label: 'Hired Workers', icon: UserCheck  },
                { id: 'payments',     label: 'Payments',      icon: DollarSign },
              ].map(item => (
                <button key={item.id}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                    activeTab === item.id ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                  <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                  {item.label}
                  {item.id === 'applications' && (dashboardData?.recentApplications?.length || 0) > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {dashboardData.recentApplications.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-h-screen">

          {errorMsg && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 items-center">
              <AlertCircle className="text-red-500" size={20} />
              <p className="text-red-800 text-sm">{errorMsg}</p>
              <button onClick={() => setErrorMsg('')} className="ml-auto text-red-400 hover:text-red-600"><X size={16} /></button>
            </div>
          )}

          {/* KYC banner — all tabs */}
          <KycBanner kycStatus={kycStatus} onNavigate={() => navigate('/kyc')} />

          {/* ═══ OVERVIEW ═══ */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900">Dashboard Overview</h1>
                  <p className="text-gray-500 mt-1">Welcome back, {userName}</p>
                </div>
                <button onClick={() => { fetchDashboard(); fetchJobs(); }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-semibold transition-all">
                  <RefreshCw size={16} /> Refresh
                </button>
              </div>

              {loadingDash ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse h-32" />)}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform`}>
                          <stat.icon size={24} />
                        </div>
                      </div>
                      <p className="text-gray-500 font-medium text-sm">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Recent Applications */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <Users className="text-indigo-600" size={20} /> Recent Applications
                  </h3>
                  {loadingDash ? (
                    <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
                  ) : (dashboardData?.recentApplications || []).length === 0 ? (
                    <div className="text-center py-8">
                      <Users size={40} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-500 text-sm">No pending applications yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dashboardData.recentApplications.map(app => (
                        <div key={app._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-indigo-50/30 hover:border-indigo-100 transition-all">
                          <div className="flex items-center gap-3">
                            <img src={app.workerId?.profilePicture || `https://i.pravatar.cc/150?u=${app.workerId?._id}`}
                              alt={app.workerId?.fullName} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{app.workerId?.fullName}</p>
                              <p className="text-xs text-gray-400">{app.jobId?.title}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => { const job = jobs.find(j => j._id === app.jobId?._id); if (job) setViewApplicationsJob(job); }}
                            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all">
                            Review
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upcoming Jobs */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <Calendar className="text-purple-600" size={20} /> Upcoming Events
                  </h3>
                  {loadingJobs ? (
                    <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
                  ) : jobs.filter(j => j.status === 'Active').length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar size={40} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-500 text-sm">No active jobs yet</p>
                      <button onClick={handleCreateJobClick}
                        className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all">
                        Post Your First Job
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {jobs.filter(j => j.status === 'Active').slice(0, 4).map(job => (
                        <div key={job._id} onClick={() => setViewApplicationsJob(job)}
                          className="p-4 border border-gray-100 rounded-xl hover:bg-purple-50/30 hover:border-purple-100 transition-all cursor-pointer">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-gray-900 text-sm">{job.title}</h4>
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase">{job.status}</span>
                          </div>
                          <div className="flex gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Calendar size={12} className="text-indigo-400" />{new Date(job.date).toLocaleDateString('en-IN')}</span>
                            <span className="flex items-center gap-1"><Users size={12} className="text-indigo-400" />{job.applicantCount} applied</span>
                            <span className="flex items-center gap-1"><MapPin size={12} className="text-indigo-400" />{job.location?.city}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══ MY JOBS ═══ */}
          {activeTab === 'jobs' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-gray-900">My Jobs</h1>
                <button onClick={handleCreateJobClick}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-indigo-200">
                  <Plus size={18} /> New Job
                </button>
              </div>

              {loadingJobs ? (
                <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-36 border border-gray-100 animate-pulse" />)}</div>
              ) : jobs.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                  <Briefcase size={56} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">No jobs posted yet</h3>
                  <p className="text-gray-500 mb-6">Post your first job to start finding volunteers</p>
                  <button onClick={handleCreateJobClick}
                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition-all">
                    Create Your First Job
                  </button>
                </div>
              ) : (
                <div className="grid gap-5">
                  {jobs.map(job => (
                    <div key={job._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-indigo-100 transition-all duration-300">
                      <div className="flex flex-col lg:flex-row justify-between gap-5">
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                                {job.urgent && <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-bold uppercase animate-pulse">Urgent</span>}
                              </div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {job.requiredSkills?.map(s => <span key={s} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold">{s}</span>)}
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyle(job.status)}`}>{job.status}</span>
                          </div>
                          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 text-sm text-gray-500">
                            <div className="flex items-center gap-2"><MapPin size={15} className="text-indigo-400 flex-shrink-0" /><span>{job.location?.city}</span></div>
                            <div className="flex items-center gap-2"><Calendar size={15} className="text-indigo-400 flex-shrink-0" /><span>{new Date(job.date).toLocaleDateString('en-IN')} • {job.time}</span></div>
                            <div className="flex items-center gap-2"><Users size={15} className="text-indigo-400 flex-shrink-0" /><span>{job.slotsFilled}/{job.slotsTotal} filled • {job.applicantCount} applied</span></div>
                            <div className="flex items-center gap-2"><DollarSign size={15} className="text-indigo-400 flex-shrink-0" /><span className="font-semibold text-gray-800">{formatPay(job.pay)}</span></div>
                          </div>
                        </div>

                        <div className="flex lg:flex-col gap-2 flex-wrap">
                          <button onClick={() => setViewApplicationsJob(job)}
                            className="flex-1 lg:flex-none px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm">
                            <Eye size={15} /> Applications ({job.applicantCount})
                          </button>
                          <button onClick={() => { setEditingJob(job); setShowJobModal(true); }}
                            className="flex-1 lg:flex-none px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm">
                            <Edit size={15} /> Edit
                          </button>
                          <button onClick={() => handleToggleStatus(job)}
                            className={`flex-1 lg:flex-none px-4 py-2 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 text-sm border ${
                              job.status === 'Active' ? 'border-amber-200 text-amber-700 hover:bg-amber-50' : 'border-green-200 text-green-700 hover:bg-green-50'
                            }`}>
                            {job.status === 'Active' ? '⏸ Pause' : '▶ Activate'}
                          </button>
                          <button onClick={() => handleDeleteJob(job._id)} disabled={deletingJobId === job._id}
                            className="flex-1 lg:flex-none px-4 py-2 border border-red-100 text-red-500 rounded-xl font-bold hover:bg-red-50 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-50">
                            {deletingJobId === job._id ? <Loader size={15} className="animate-spin" /> : <Trash2 size={15} />} Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ APPLICATIONS ═══ */}
          {activeTab === 'applications' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-extrabold text-gray-900">Applications</h1>
              {loadingJobs ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-24 border border-gray-100 animate-pulse" />)}</div>
              ) : jobs.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                  <Users size={56} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 font-medium">Post jobs first to receive applications</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {jobs.map(job => (
                    <div key={job._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-indigo-100 hover:shadow-md transition-all">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-gray-900">{job.title}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusStyle(job.status)}`}>{job.status}</span>
                          </div>
                          <div className="flex gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1"><MapPin size={13} className="text-indigo-400" /> {job.location?.city}</span>
                            <span className="flex items-center gap-1"><Calendar size={13} className="text-indigo-400" /> {new Date(job.date).toLocaleDateString('en-IN')}</span>
                            <span className="flex items-center gap-1"><Users size={13} className="text-indigo-400" /> {job.applicantCount} applied</span>
                          </div>
                        </div>
                        <button onClick={() => setViewApplicationsJob(job)}
                          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2 flex-shrink-0">
                          <Eye size={15} /> View Applicants
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ HIRED ═══ */}
          {activeTab === 'hired' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-extrabold text-gray-900">Hired Workers</h1>
              {loadingHired ? (
                <div className="bg-white rounded-2xl border border-gray-100 h-64 animate-pulse" />
              ) : hiredWorkers.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                  <UserCheck size={56} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">No hired workers yet</h3>
                  <p className="text-gray-500">Accept applications to hire workers</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="p-4 font-bold text-gray-600 text-sm">Worker</th>
                          <th className="p-4 font-bold text-gray-600 text-sm">Job</th>
                          <th className="p-4 font-bold text-gray-600 text-sm">Event Date</th>
                          <th className="p-4 font-bold text-gray-600 text-sm">Pay</th>
                          <th className="p-4 font-bold text-gray-600 text-sm">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hiredWorkers.map(hire => (
                          <tr key={hire._id} className="border-b border-gray-50 hover:bg-indigo-50/20 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img src={hire.workerId?.profilePicture || `https://i.pravatar.cc/150?u=${hire.workerId?._id}`}
                                  alt={hire.workerId?.fullName} className="w-9 h-9 rounded-full object-cover" />
                                <div>
                                  <p className="font-semibold text-sm text-gray-900">{hire.workerId?.fullName}</p>
                                  <p className="text-xs text-gray-400">{hire.workerId?.phone}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-sm text-gray-700 font-medium">{hire.jobId?.title}</td>
                            <td className="p-4 text-sm text-gray-500">{hire.jobId?.date ? new Date(hire.jobId.date).toLocaleDateString('en-IN') : '—'}</td>
                            <td className="p-4 text-sm font-bold text-gray-900">{formatPay(hire.jobId?.pay)}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${hire.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                {hire.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ PAYMENTS ═══ */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-gray-900">Payments</h1>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-bold">
                  <Download size={16} /> Statement
                </button>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl text-white shadow-lg">
                  <p className="text-indigo-100 text-sm font-medium">Escrow Balance</p>
                  <p className="text-3xl font-bold mt-1">₹{(dashboardData?.stats?.escrowBalance || 0).toLocaleString('en-IN')}</p>
                  <button className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-all">Add Funds</button>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-gray-500 text-sm font-medium">Total Jobs Posted</p>
                  <p className="text-3xl font-bold mt-1">{dashboardData?.stats?.totalJobsPosted || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-gray-500 text-sm font-medium">Total Hires Made</p>
                  <p className="text-3xl font-bold mt-1">{dashboardData?.stats?.totalHires || 0}</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                <DollarSign size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">Payment history will appear here</p>
                <p className="text-sm text-gray-400 mt-1">Escrow & transaction system coming soon</p>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODALS */}
      {showJobModal && (
        <JobModal
          onClose={() => { setShowJobModal(false); setEditingJob(null); }}
          onCreate={handleJobSaved}
          editJob={editingJob}
          kycStatus={kycStatus}
        />
      )}
      {viewApplicationsJob && (
        <ApplicationsModal
          job={viewApplicationsJob}
          onClose={() => setViewApplicationsJob(null)}
          onRespond={() => { fetchDashboard(); fetchJobs(); }}
        />
      )}
      {showKycModal && (
        <KycRequiredModal kycStatus={kycStatus} onClose={() => setShowKycModal(false)} />
      )}
    </div>
  );
};

export default OrganizerDashboard;