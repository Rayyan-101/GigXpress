import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Shield, CheckCircle, AlertCircle, Clock,
  User, Mail, Phone, MapPin, Briefcase, Star, Award,
  Edit3, LogOut, Loader, XCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiFetch = async (path, options = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,

    // 🔥 VERY IMPORTANT → send cookies automatically
    credentials: 'include',

    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await res.json();

  // 🔥 Optional global error handling
  if (res.status === 401) {
    console.error("Unauthorized - redirecting to login");
    window.location.href = "/login";
  }

  if (res.status === 403) {
    console.error("Forbidden - access denied");
  }

  return data;
};

const KycStatusBadge = ({ status }) => {
  const cfg = {
    verified:    { icon: CheckCircle,  color: 'bg-green-100 text-green-700 border-green-200',  label: 'KYC Verified'      },
    in_progress: { icon: Clock,        color: 'bg-amber-100 text-amber-700 border-amber-200',  label: 'Under Review'      },
    rejected:    { icon: XCircle,      color: 'bg-red-100 text-red-700 border-red-200',        label: 'KYC Rejected'      },
    pending:     { icon: AlertCircle,  color: 'bg-gray-100 text-gray-600 border-gray-200',    label: 'KYC Not Submitted' },
  }[status] || { icon: AlertCircle, color: 'bg-gray-100 text-gray-600 border-gray-200', label: 'Unknown' };

  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${cfg.color}`}>
      <Icon size={14} /> {cfg.label}
    </span>
  );
};

const ProfilePage = () => {
  const navigate  = useNavigate();
  const role      = localStorage.getItem('userRole');

  const [profileData, setProfileData] = useState(null);
  const [kycData,     setKycData]     = useState(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      const [profileRes, kycRes] = await Promise.all([
        apiFetch(role === 'organizer' ? '/api/organizers/profile' : '/api/workers/profile'),
        apiFetch('/api/kyc/my'),
      ]);
      if (profileRes.success) setProfileData(profileRes.data);
      if (kycRes.success)     setKycData(kycRes.data);
      setLoading(false);
    };
    load();
  }, [role]);

  const handleLogout = () => {
    ['token','userRole','userId','userName','userEmail'].forEach(k => localStorage.removeItem(k));
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  const user    = profileData?.user;
  const profile = profileData?.profile;
  const kycStatus = user?.kycStatus || 'pending';
  const submission = kycData?.submission;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={20} />
            </button>
            <span className="text-lg font-bold text-gray-900">My Profile</span>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm font-semibold transition-all">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-5">

        {/* ── Profile Hero ── */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <img
              src={user?.profilePicture || `https://i.pravatar.cc/150?u=${user?.email}`}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
            />
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold mb-1">{user?.fullName}</h1>
              <p className="text-white/80 text-sm capitalize mb-3">
                {role} • {role === 'worker' ? (profile?.currentLevel || 'beginner') : (profile?.organizationType || 'organizer')}
              </p>
              <KycStatusBadge status={kycStatus} />
            </div>
          </div>
        </div>

        {/* ── KYC Status Card ── */}
        <div className={`rounded-2xl border p-5 shadow-sm ${
          kycStatus === 'verified'    ? 'bg-green-50 border-green-200' :
          kycStatus === 'rejected'    ? 'bg-red-50 border-red-200' :
          kycStatus === 'in_progress' ? 'bg-amber-50 border-amber-200' :
          'bg-white border-gray-100'
        }`}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              {kycStatus === 'verified' && <CheckCircle className="text-green-600 mt-0.5 flex-shrink-0" size={24} />}
              {kycStatus === 'in_progress' && <Clock className="text-amber-600 mt-0.5 flex-shrink-0" size={24} />}
              {kycStatus === 'rejected' && <XCircle className="text-red-600 mt-0.5 flex-shrink-0" size={24} />}
              {kycStatus === 'pending' && <AlertCircle className="text-gray-500 mt-0.5 flex-shrink-0" size={24} />}

              <div>
                <p className="font-bold text-gray-900">
                  {kycStatus === 'verified'    && 'Identity Verified ✓'}
                  {kycStatus === 'in_progress' && 'Documents Under Review'}
                  {kycStatus === 'rejected'    && 'Verification Failed'}
                  {kycStatus === 'pending'     && 'KYC Not Completed'}
                </p>
                <p className="text-sm text-gray-600 mt-0.5">
                  {kycStatus === 'verified'    && `You can ${role === 'organizer' ? 'post jobs and hire workers' : 'apply for gigs'}.`}
                  {kycStatus === 'in_progress' && 'Your documents are being reviewed. This takes 24–48 hours.'}
                  {kycStatus === 'rejected'    && (submission?.rejectionReason || 'Documents were unclear or invalid.')}
                  {kycStatus === 'pending'     && `Complete KYC to ${role === 'organizer' ? 'post jobs' : 'apply for gigs'}.`}
                </p>
              </div>
            </div>

            {(kycStatus === 'pending' || kycStatus === 'rejected') && (
              <button
                onClick={() => navigate('/kyc')}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all flex-shrink-0">
                {kycStatus === 'rejected' ? 'Re-submit KYC' : 'Complete KYC'}
              </button>
            )}
          </div>
        </div>

        {/* ── Account Details ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User size={18} className="text-indigo-600" /> Account Details
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: User,     label: 'Full Name', value: user?.fullName },
              { icon: Mail,     label: 'Email',     value: user?.email },
              { icon: Phone,    label: 'Phone',     value: user?.phone },
              { icon: Shield,   label: 'KYC Status', value: (user?.kycStatus || 'pending').replace('_', ' ').toUpperCase() },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Icon size={16} className="text-indigo-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="font-semibold text-gray-800 text-sm">{value || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Role-specific details ── */}
        {role === 'organizer' && profile && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase size={18} className="text-indigo-600" /> Organization Details
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: 'Organization',  value: profile.organizationName },
                { label: 'Type',          value: profile.organizationType },
                { label: 'GST Number',    value: profile.gstNumber || 'Not provided' },
                { label: 'Address',       value: profile.address?.fullAddress },
                { label: 'Jobs Posted',   value: profile.statistics?.totalJobsPosted || 0 },
                { label: 'Total Hires',   value: profile.statistics?.totalHires || 0 },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="font-semibold text-gray-800 text-sm capitalize">{value || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {role === 'worker' && profile && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award size={18} className="text-indigo-600" /> Volunteer Details
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: 'Location',          value: profile.location?.city },
                { label: 'Experience Level',  value: profile.experienceLevel },
                { label: 'Current Level',     value: profile.currentLevel },
                { label: 'Gigs Completed',    value: profile.statistics?.totalGigsCompleted || 0 },
                { label: 'Average Rating',    value: profile.ratings?.average ? `${profile.ratings.average} / 5` : 'No ratings yet' },
                { label: 'Reliability Score', value: `${profile.reliabilityScore || 100}%` },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="font-semibold text-gray-800 text-sm capitalize">{value || '—'}</p>
                </div>
              ))}
            </div>

            {profile.skills?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map(s => (
                    <span key={s} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* KYC submission history */}
        {submission && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield size={18} className="text-indigo-600" /> KYC Submission
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400">Submitted At</p>
                <p className="font-semibold text-gray-800 text-sm">{new Date(submission.submittedAt).toLocaleString('en-IN')}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400">Aadhaar</p>
                <p className="font-semibold text-gray-800 text-sm font-mono">
                  {'•'.repeat(8) + submission.aadhaarNumber?.slice(-4)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400">PAN</p>
                <p className="font-semibold text-gray-800 text-sm font-mono">{submission.panNumber}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400">Review Status</p>
                <p className={`font-bold text-sm capitalize ${
                  submission.status === 'approved' ? 'text-green-700' :
                  submission.status === 'rejected' ? 'text-red-700' :
                  'text-amber-700'
                }`}>{submission.status?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Danger zone */}
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
          <h3 className="font-bold text-red-600 mb-3">Account Actions</h3>
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-50 transition-all">
            <LogOut size={16} /> Sign Out
          </button>
        </div>

      </main>
    </div>
  );
};

export default ProfilePage;