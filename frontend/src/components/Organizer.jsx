import React, { useState, useEffect, useCallback } from 'react';
import {
  Briefcase, Plus, Users, Clock, DollarSign, CheckCircle,
  Star, MapPin, Calendar, Search, Edit, Trash2, Eye,
  UserCheck, TrendingUp, AlertCircle, Download, BarChart3,
  Settings, Bell, Menu, X, Loader, RefreshCw, ChevronDown,
  CheckSquare, XSquare, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─── API BASE URL ─────────────────────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── API HELPER ───────────────────────────────────────────────────────────────
const apiFetch = async (path, options = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include', // ✅ THIS IS THE KEY FIX
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  return res.json();
};



  
// ─── SKILL OPTIONS ────────────────────────────────────────────────────────────
const SKILL_OPTIONS = [
  'Event Management', 'Hospitality', 'Marketing', 'Technical Support',
  'AV Setup', 'Crowd Management', 'Registration Desk', 'Photography', 'Decoration'
];

const CATEGORIES = ['Music', 'Sports', 'Corporate', 'Wedding', 'Education', 'Food', 'Startup', 'NGO', 'Community', 'Tech', 'Other'];

// ─── CREATE / EDIT JOB MODAL ──────────────────────────────────────────────────
const JobModal = ({ onClose, onCreate, editJob = null }) => {
  const isEdit = !!editJob;

  const [form, setForm] = useState({
    title:          editJob?.title          || '',
    location:       editJob?.location?.city || '',
    date:           editJob?.date           ? new Date(editJob.date).toISOString().split('T')[0] : '',
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

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleSkill = (skill) => {
    setForm(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.includes(skill)
        ? prev.requiredSkills.filter(s => s !== skill)
        : [...prev.requiredSkills, skill]
    }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.location || !form.date || !form.time || !form.slotsTotal || !form.pay) {
      setError('Please fill all required fields (Title, Location, Date, Time, Workers, Pay)');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      title:          form.title.trim(),
      location:       {
  city: form.location.trim()
                      },
      date:           form.date,
      time:           form.time,
      duration:       form.duration,
      slotsTotal:     Number(form.slotsTotal),
      pay:            { amount: Number(form.pay), type: form.payType === 'per_day' ? 'fixed' : 'hourly' },
      category:       form.category,
      description:    form.description.trim(),
      requirements:   form.requirements.trim(),
      requiredSkills: form.requiredSkills,
      urgent:         form.urgent,
    };

    try {
      let data;
      if (isEdit) {
        data = await apiFetch(`/api/jobs/${editJob._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        data = await apiFetch('/api/jobs', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      if (data.success) {
        onCreate(data.data.job);
        onClose();
      } else {
        setError(data.message || 'Failed to save job. Please try again.');
      }
    } catch (err) {
      setError('Unable to connect to server. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b sticky top-0 bg-white/95 backdrop-blur z-10 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Job' : 'Create New Job'}
          </h3>
          <button onClick={onClose} disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2 items-start">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title *</label>
            <input type="text" name="title" value={form.title} onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g., Wedding Event Staff Required" />
          </div>

          {/* Location + Date */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">City / Location *</label>
              <input type="text" name="location" value={form.location} onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Pune, Koregaon Park" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Event Date *</label>
              <input type="date" name="date" value={form.date} onChange={handleChange}
                disabled={loading}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>

          {/* Time + Duration */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time *</label>
              <input type="time" name="time" value={form.time} onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
              <select name="duration" value={form.duration} onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="Full Day">Full Day</option>
                <option value="Half Day">Half Day</option>
                <option value="2 Hours">2 Hours</option>
                <option value="4 Hours">4 Hours</option>
                <option value="6 Hours">6 Hours</option>
                <option value="8 Hours">8 Hours</option>
              </select>
            </div>
          </div>

          {/* Workers + Pay */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Workers Needed *</label>
              <input type="number" name="slotsTotal" value={form.slotsTotal} onChange={handleChange}
                disabled={loading} min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="5" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pay per Worker (₹) *</label>
              <div className="flex gap-2">
                <input type="number" name="pay" value={form.pay} onChange={handleChange}
                  disabled={loading} min="0"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="1500" />
                <select name="payType" value={form.payType} onChange={handleChange}
                  disabled={loading}
                  className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                  <option value="per_day">/day</option>
                  <option value="per_hour">/hr</option>
                  <option value="fixed">fixed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category + Urgent */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select name="category" value={form.category} onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-200 rounded-lg w-full hover:bg-gray-50">
                <input type="checkbox" name="urgent" checked={form.urgent} onChange={handleChange}
                  disabled={loading} className="w-5 h-5 accent-indigo-600" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Mark as Urgent</p>
                  <p className="text-xs text-gray-500">Shown with priority badge</p>
                </div>
              </label>
            </div>
          </div>

          {/* Required Skills */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Required Skills</label>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map(skill => (
                <button key={skill} type="button" onClick={() => toggleSkill(skill)} disabled={loading}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    form.requiredSkills.includes(skill)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}>
                  {skill}
                </button>
              ))}
            </div>
            {form.requiredSkills.length > 0 && (
              <p className="text-xs text-indigo-600 mt-2">✓ {form.requiredSkills.length} skill(s) selected</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Job Description</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              disabled={loading} rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Describe the responsibilities and what workers will be doing..." />
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Special Requirements</label>
            <textarea name="requirements" value={form.requirements} onChange={handleChange}
              disabled={loading} rows="2"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g., Must have own camera, Formal dress code..." />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Escrow Payment Required</p>
              <p>Deposit total budget (₹{form.pay && form.slotsTotal ? Number(form.pay) * Number(form.slotsTotal) : '—'}) to escrow before workers are confirmed.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex gap-3 justify-end sticky bottom-0">
          <button onClick={onClose} disabled={loading}
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-white transition-all active:scale-95">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2">
            {loading ? <><Loader size={18} className="animate-spin" /> Saving...</> : isEdit ? 'Save Changes' : 'Publish Job'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── APPLICATIONS MODAL (per job) ─────────────────────────────────────────────
const ApplicationsModal = ({ job, onClose, onRespond }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [responding, setResponding]     = useState(null); // applicationId being actioned

  useEffect(() => {
    const load = async () => {
      const data = await apiFetch(`/api/applications/job/${job._id}`);
      if (data.success) setApplications(data.data.applications);
      setLoading(false);
    };
    load();
  }, [job._id]);

  const handleRespond = async (applicationId, status) => {
    setResponding(applicationId);
    const data = await apiFetch(`/api/applications/${applicationId}/respond`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    if (data.success) {
      setApplications(prev =>
        prev.map(a => a._id === applicationId ? { ...a, status } : a)
      );
      onRespond(); // refresh parent stats
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
            <div className="flex justify-center py-12">
              <Loader className="animate-spin text-indigo-600" size={32} />
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No applications yet</p>
              <p className="text-sm text-gray-400 mt-1">Check back later — workers will apply soon.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map(app => {
                const worker     = app.workerId;
                const profile    = app.workerProfile;
                const isPending  = app.status === 'Pending';

                return (
                  <div key={app._id} className="border border-gray-100 rounded-xl p-5 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      {/* Worker info */}
                      <div className="flex gap-4">
                        <img
                          src={worker?.profilePicture || `https://i.pravatar.cc/150?u=${worker?._id}`}
                          alt={worker?.fullName}
                          className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                        />
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
                          <p className="text-xs text-gray-400 mt-2">
                            Applied {new Date(app.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Status + Actions */}
                      <div className="flex sm:flex-col gap-2 items-start sm:items-end">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          app.status === 'Accepted'  ? 'bg-green-100 text-green-700' :
                          app.status === 'Rejected'  ? 'bg-red-100 text-red-700' :
                          app.status === 'Withdrawn' ? 'bg-gray-100 text-gray-600' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {app.status}
                        </span>

                        {isPending && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRespond(app._id, 'Accepted')}
                              disabled={responding === app._id}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 transition-all active:scale-95 flex items-center gap-1 disabled:opacity-60">
                              {responding === app._id ? <Loader size={14} className="animate-spin" /> : <CheckSquare size={14} />}
                              Hire
                            </button>
                            <button
                              onClick={() => handleRespond(app._id, 'Rejected')}
                              disabled={responding === app._id}
                              className="px-4 py-2 border border-red-200 text-red-600 rounded-lg font-semibold text-sm hover:bg-red-50 transition-all active:scale-95 flex items-center gap-1 disabled:opacity-60">
                              {responding === app._id ? <Loader size={14} className="animate-spin" /> : <XSquare size={14} />}
                              Reject
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

// ─── MAIN ORGANIZER DASHBOARD ─────────────────────────────────────────────────
const OrganizerDashboard = () => {
  const [user, setUser] = useState(null);
  useEffect(() => {
  const checkAuth = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/me', {
        credentials: 'include'
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUser(data.data.user);
      } else {
        setUser(null); // 🔥 IMPORTANT
      }
    } catch (err) {
      console.error('Auth check failed', err);
    } 
  };

  checkAuth();
}, []);

  const navigate = useNavigate();

  const [activeTab,           setActiveTab]           = useState('overview');
  const [sidebarOpen,         setSidebarOpen]         = useState(false);
  const [showJobModal,        setShowJobModal]        = useState(false);
  const [editingJob,          setEditingJob]          = useState(null);  // job object being edited
  const [viewApplicationsJob, setViewApplicationsJob] = useState(null); // job to view apps for

  // Data states
  const [dashboardData,  setDashboardData]  = useState(null);
  const [jobs,           setJobs]           = useState([]);
  const [hiredWorkers,   setHiredWorkers]   = useState([]);

  // Loading / error states
  const [loadingDash,   setLoadingDash]   = useState(true);
  const [loadingJobs,   setLoadingJobs]   = useState(true);
  const [loadingHired,  setLoadingHired]  = useState(false);
  const [deletingJobId, setDeletingJobId] = useState(null);
  const [errorMsg,      setErrorMsg]      = useState('');

  // User info from localStorage (set during login/register)
  const userName  = localStorage.getItem('userName')  || 'Organizer';
  const userEmail = localStorage.getItem('userEmail') || '';

  // ── Logout ──────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    ['token', 'userRole', 'userId', 'userName', 'userEmail'].forEach(k => localStorage.removeItem(k));
    navigate('/login');
  };

  // ── Fetch dashboard stats + recent applications ──────────────────────────────
  const fetchDashboard = useCallback(async () => {
    setLoadingDash(true);
    const data = await apiFetch('/api/organizers/dashboard');
    if (data.success) setDashboardData(data.data);
    else setErrorMsg(data.message || 'Failed to load dashboard.');
    setLoadingDash(false);
  }, []);

  // ── Fetch organizer's own jobs ───────────────────────────────────────────────
  const fetchJobs = useCallback(async () => {
    setLoadingJobs(true);
    const data = await apiFetch('/api/jobs/my');
    if (data.success) setJobs(data.data.jobs);
    else setErrorMsg(data.message || 'Failed to load jobs.');
    setLoadingJobs(false);
  }, []);

  // ── Fetch hired workers ─────────────────────────────────────────────────────
  const fetchHired = useCallback(async () => {
    setLoadingHired(true);
    const data = await apiFetch('/api/organizers/hired');
    if (data.success) setHiredWorkers(data.data.hired);
    setLoadingHired(false);
  }, []);

  // Initial load
  useEffect(() => {
    fetchDashboard();
    fetchJobs();
  }, [fetchDashboard, fetchJobs]);

  // Load hired workers only when that tab is opened
  useEffect(() => {
    if (activeTab === 'hired') fetchHired();
  }, [activeTab, fetchHired]);

  // ── After job created or edited — update list without full reload ────────────
  const handleJobSaved = (savedJob) => {
    setJobs(prev => {
      const exists = prev.find(j => j._id === savedJob._id);
      if (exists) return prev.map(j => j._id === savedJob._id ? savedJob : j);
      return [savedJob, ...prev];
    });
    fetchDashboard(); // refresh stats
    setEditingJob(null);
  };

  // ── Delete job ───────────────────────────────────────────────────────────────
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job? All applications will also be removed.')) return;
    setDeletingJobId(jobId);
    const data = await apiFetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
    if (data.success) {
      setJobs(prev => prev.filter(j => j._id !== jobId));
      fetchDashboard();
    } else {
      alert(data.message || 'Failed to delete job.');
    }
    setDeletingJobId(null);
  };

  // ── Toggle job status (Active / Paused) ──────────────────────────────────────
  const handleToggleStatus = async (job) => {
    const newStatus = job.status === 'Active' ? 'Paused' : 'Active';
    const data = await apiFetch(`/api/jobs/${job._id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus }),
    });
    if (data.success) {
      setJobs(prev => prev.map(j => j._id === job._id ? { ...j, status: newStatus } : j));
      fetchDashboard();
    }
  };

  // ── Build stats cards from real data ────────────────────────────────────────
  const stats = dashboardData ? [
    { label: 'Active Jobs',        value: String(dashboardData.stats.activeJobs),       icon: Briefcase,  color: 'from-blue-500 to-blue-600'    },
    { label: 'Total Jobs Posted',  value: String(dashboardData.stats.totalJobsPosted),  icon: TrendingUp, color: 'from-purple-500 to-purple-600' },
    { label: 'Total Hires',        value: String(dashboardData.stats.totalHires),        icon: UserCheck,  color: 'from-green-500 to-green-600'   },
    { label: 'Escrow Balance',     value: `₹${dashboardData.stats.escrowBalance.toLocaleString('en-IN')}`, icon: DollarSign, color: 'from-indigo-500 to-indigo-600' },
  ] : [];

  // ── Helper: format pay string ─────────────────────────────────────────────
  const formatPay = (pay) => {
    if (!pay) return '—';
    const typeLabel = pay.type === 'per_day' ? '/day' : pay.type === 'per_hour' ? '/hr' : ' fixed';
    return `₹${pay.amount?.toLocaleString('en-IN')}${typeLabel}`;
  };

  // ── Helper: status badge colours ─────────────────────────────────────────
  const statusStyle = (status) => {
    const map = {
      Active:    'bg-green-100 text-green-700',
      Paused:    'bg-amber-100 text-amber-700',
      Completed: 'bg-blue-100 text-blue-700',
      Cancelled: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased text-gray-900">

      {/* ── NAVBAR ── */}
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
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  GigXpress
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                <Bell size={20} />
                {dashboardData?.recentApplications?.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                )}
              </button>
              <div className="flex items-center gap-2 pl-3 border-l">
                <img src={`https://i.pravatar.cc/150?u=${userEmail}`} alt="Profile"
                  className="w-9 h-9 rounded-full ring-2 ring-indigo-100" />
                <div className="hidden sm:block">
                  <p className="text-sm font-bold leading-tight">{user?.fullName}</p>
                  <p className="text-xs text-indigo-600 font-medium">Organizer</p>
                </div>
              </div>
              <button onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* ── SIDEBAR ── */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r
          transition-transform duration-300 ease-in-out shadow-sm`}>
          <div className="p-5 space-y-5 pt-4">
            <button
              onClick={() => { setShowJobModal(true); setSidebarOpen(false); }}
              className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold
                hover:opacity-90 shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
              <Plus size={20} /> Create New Job
            </button>

            <nav className="space-y-1">
              {[
                { id: 'overview',      label: 'Overview',       icon: BarChart3  },
                { id: 'jobs',          label: 'My Jobs',        icon: Briefcase  },
                { id: 'applications',  label: 'Applications',   icon: Users      },
                { id: 'hired',         label: 'Hired Workers',  icon: UserCheck  },
                { id: 'payments',      label: 'Payments',       icon: DollarSign },
              ].map(item => (
                <button key={item.id}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                    activeTab === item.id
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                  <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                  {item.label}
                  {item.id === 'applications' && dashboardData?.recentApplications?.length > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {dashboardData.recentApplications.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-h-screen">

          {errorMsg && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 items-center">
              <AlertCircle className="text-red-500" size={20} />
              <p className="text-red-800 text-sm">{errorMsg}</p>
              <button onClick={() => setErrorMsg('')} className="ml-auto text-red-400 hover:text-red-600">
                <X size={16} />
              </button>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              TAB 1: OVERVIEW
          ════════════════════════════════════════════════════════════════════ */}
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

              {/* Stat cards */}
              {loadingDash ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse h-32" />
                  ))}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100
                      hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center
                          justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform`}>
                          <stat.icon size={24} />
                        </div>
                      </div>
                      <p className="text-gray-500 font-medium text-sm">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Recent Applications + Upcoming Jobs */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Recent Applications */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <Users className="text-indigo-600" size={20} /> Recent Applications
                  </h3>
                  {loadingDash ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
                    </div>
                  ) : dashboardData?.recentApplications?.length === 0 ? (
                    <div className="text-center py-8">
                      <Users size={40} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-500 text-sm">No pending applications yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dashboardData?.recentApplications?.map(app => (
                        <div key={app._id}
                          className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-indigo-50/30 hover:border-indigo-100 transition-all">
                          <div className="flex items-center gap-3">
                            <img
                              src={app.workerId?.profilePicture || `https://i.pravatar.cc/150?u=${app.workerId?._id}`}
                              alt={app.workerId?.fullName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{app.workerId?.fullName}</p>
                              <p className="text-xs text-gray-400">{app.jobId?.title}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const job = jobs.find(j => j._id === app.jobId?._id);
                              if (job) setViewApplicationsJob(job);
                            }}
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
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
                    </div>
                  ) : jobs.filter(j => j.status === 'Active').length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar size={40} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-500 text-sm">No active jobs yet</p>
                      <button onClick={() => setShowJobModal(true)}
                        className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all">
                        Post Your First Job
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {jobs.filter(j => j.status === 'Active').slice(0, 4).map(job => (
                        <div key={job._id}
                          className="p-4 border border-gray-100 rounded-xl hover:bg-purple-50/30 hover:border-purple-100 transition-all cursor-pointer"
                          onClick={() => setViewApplicationsJob(job)}>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-gray-900 text-sm">{job.title}</h4>
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase">
                              {job.status}
                            </span>
                          </div>
                          <div className="flex gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} className="text-indigo-400" />
                              {new Date(job.date).toLocaleDateString('en-IN')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users size={12} className="text-indigo-400" />
                              {job.applicantCount} applied
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={12} className="text-indigo-400" />
                              {job.location?.city}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              TAB 2: MY JOBS
          ════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'jobs' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-gray-900">My Jobs</h1>
                <button onClick={() => setShowJobModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600
                    text-white rounded-xl font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-indigo-200">
                  <Plus size={18} /> New Job
                </button>
              </div>

              {loadingJobs ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-36 border border-gray-100 animate-pulse" />)}
                </div>
              ) : jobs.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                  <Briefcase size={56} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">No jobs posted yet</h3>
                  <p className="text-gray-500 mb-6">Post your first job to start finding volunteers</p>
                  <button onClick={() => setShowJobModal(true)}
                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition-all">
                    Create Your First Job
                  </button>
                </div>
              ) : (
                <div className="grid gap-5">
                  {jobs.map(job => (
                    <div key={job._id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-indigo-100 transition-all duration-300">
                      <div className="flex flex-col lg:flex-row justify-between gap-5">
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                                {job.urgent && (
                                  <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-bold uppercase animate-pulse">
                                    Urgent
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {job.requiredSkills?.map(s => (
                                  <span key={s} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold">{s}</span>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyle(job.status)}`}>
                                {job.status}
                              </span>
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <MapPin size={15} className="text-indigo-400 flex-shrink-0" />
                              <span>{job.location?.city}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar size={15} className="text-indigo-400 flex-shrink-0" />
                              <span>{new Date(job.date).toLocaleDateString('en-IN')} • {job.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users size={15} className="text-indigo-400 flex-shrink-0" />
                              <span>{job.slotsFilled}/{job.slotsTotal} filled • {job.applicantCount} applied</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign size={15} className="text-indigo-400 flex-shrink-0" />
                              <span className="font-semibold text-gray-800">{formatPay(job.pay)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex lg:flex-col gap-2 flex-wrap">
                          <button onClick={() => setViewApplicationsJob(job)}
                            className="flex-1 lg:flex-none px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold
                              hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm">
                            <Eye size={15} /> Applications ({job.applicantCount})
                          </button>
                          <button onClick={() => { setEditingJob(job); setShowJobModal(true); }}
                            className="flex-1 lg:flex-none px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-bold
                              hover:bg-gray-50 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm">
                            <Edit size={15} /> Edit
                          </button>
                          <button onClick={() => handleToggleStatus(job)}
                            className={`flex-1 lg:flex-none px-4 py-2 rounded-xl font-bold transition-all active:scale-95
                              flex items-center justify-center gap-2 text-sm border ${
                              job.status === 'Active'
                                ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                                : 'border-green-200 text-green-700 hover:bg-green-50'
                            }`}>
                            {job.status === 'Active' ? '⏸ Pause' : '▶ Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job._id)}
                            disabled={deletingJobId === job._id}
                            className="flex-1 lg:flex-none px-4 py-2 border border-red-100 text-red-500 rounded-xl font-bold
                              hover:bg-red-50 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-50">
                            {deletingJobId === job._id
                              ? <Loader size={15} className="animate-spin" />
                              : <Trash2 size={15} />}
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              TAB 3: APPLICATIONS (all pending across all jobs)
          ════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'applications' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-extrabold text-gray-900">Applications</h1>

              {loadingJobs ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-24 border border-gray-100 animate-pulse" />)}
                </div>
              ) : jobs.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                  <Users size={56} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 font-medium">Post jobs first to receive applications</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {jobs.map(job => (
                    <div key={job._id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-indigo-100 hover:shadow-md transition-all">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-gray-900">{job.title}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusStyle(job.status)}`}>
                              {job.status}
                            </span>
                          </div>
                          <div className="flex gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin size={13} className="text-indigo-400" /> {job.location?.city}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={13} className="text-indigo-400" /> {new Date(job.date).toLocaleDateString('en-IN')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users size={13} className="text-indigo-400" /> {job.applicantCount} applied
                            </span>
                          </div>
                        </div>
                        <button onClick={() => setViewApplicationsJob(job)}
                          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm
                            hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2 flex-shrink-0">
                          <Eye size={15} /> View Applicants
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              TAB 4: HIRED WORKERS
          ════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'hired' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-extrabold text-gray-900">Hired Workers</h1>

              {loadingHired ? (
                <div className="bg-white rounded-2xl border border-gray-100 h-64 animate-pulse" />
              ) : hiredWorkers.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                  <UserCheck size={56} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">No hired workers yet</h3>
                  <p className="text-gray-500">Accept applications from the Applications tab to hire workers</p>
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
                          <tr key={hire._id}
                            className="border-b border-gray-50 hover:bg-indigo-50/20 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={hire.workerId?.profilePicture || `https://i.pravatar.cc/150?u=${hire.workerId?._id}`}
                                  alt={hire.workerId?.fullName}
                                  className="w-9 h-9 rounded-full object-cover"
                                />
                                <div>
                                  <p className="font-semibold text-sm text-gray-900">{hire.workerId?.fullName}</p>
                                  <p className="text-xs text-gray-400">{hire.workerId?.phone}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-sm text-gray-700 font-medium">{hire.jobId?.title}</td>
                            <td className="p-4 text-sm text-gray-500">
                              {hire.jobId?.date ? new Date(hire.jobId.date).toLocaleDateString('en-IN') : '—'}
                            </td>
                            <td className="p-4 text-sm font-bold text-gray-900">{formatPay(hire.jobId?.pay)}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                hire.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                              }`}>
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

          {/* ════════════════════════════════════════════════════════════════════
              TAB 5: PAYMENTS
          ════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-gray-900">Payments</h1>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-bold">
                  <Download size={16} /> Statement
                </button>
              </div>

              {/* Balance cards from real dashboard data */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl text-white shadow-lg">
                  <p className="text-indigo-100 text-sm font-medium">Escrow Balance</p>
                  <p className="text-3xl font-bold mt-1">
                    ₹{dashboardData?.stats?.escrowBalance?.toLocaleString('en-IN') || '0'}
                  </p>
                  <button className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-all">
                    Add Funds
                  </button>
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

      {/* ── MODALS ── */}

      {/* Create / Edit Job Modal */}
      {showJobModal && (
        <JobModal
          onClose={() => { setShowJobModal(false); setEditingJob(null); }}
          onCreate={handleJobSaved}
          editJob={editingJob}
        />
      )}

      {/* Applications for a specific job */}
      {viewApplicationsJob && (
        <ApplicationsModal
          job={viewApplicationsJob}
          onClose={() => setViewApplicationsJob(null)}
          onRespond={() => { fetchDashboard(); fetchJobs(); }}
        />
      )}
    </div>
  );
};

export default OrganizerDashboard;