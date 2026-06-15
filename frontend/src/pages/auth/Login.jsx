import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, Mail, Lock, Eye, EyeOff,
  ArrowLeft, AlertCircle, Loader, Shield, CheckCircle, Zap
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL;

const ROLE_ROUTES = { organizer: '/organizer', worker: '/volunteer', admin: '/admin' };

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

const BENEFITS = [
  { icon: Shield,       label: 'Escrow-protected payments'   },
  { icon: CheckCircle,  label: 'KYC verified users only'     },
  { icon: Zap,          label: 'Instant gig matching'        },
];

// ─── Component ────────────────────────────────────────────────────────────────
const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Inject font
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { if (document.head.contains(link)) document.head.removeChild(link); };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validate = () => {
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all fields.'); return false;
    }
    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address.'); return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.'); return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        // TODO: Replace with AuthContext → setUser(data.data.user)
        sessionStorage.setItem('userName', data.data.user.fullName);
        navigate(ROLE_ROUTES[data.data.user.role] || '/');
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch {
      setError('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="min-h-screen flex">

      {/* ── LEFT PANEL — brand ────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] bg-slate-950 flex-col justify-between p-14 relative overflow-hidden">
        {/* Ambient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-indigo-600/25 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #818cf8 1px, transparent 0)', backgroundSize: '36px 36px' }} />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-900/50">
            <Briefcase className="text-white" size={20} />
          </div>
          <span className="text-2xl font-extrabold text-white tracking-tight">
            Gig<span className="text-indigo-400">Xpress</span>
          </span>
        </div>

        {/* Main copy */}
        <div className="relative space-y-8">
          <div>
            <h2 className="text-5xl font-black text-white leading-tight mb-4">
              Welcome<br />back 👋
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-xs">
              Log in to access your dashboard and start earning on your terms.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            {BENEFITS.map((b, i) => (
              <div key={i} className="flex items-center gap-3.5">
                <div className="w-9 h-9 bg-indigo-500/15 border border-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <b.icon size={16} className="text-indigo-400" />
                </div>
                <span className="text-slate-300 text-sm font-medium">{b.label}</span>
              </div>
            ))}
          </div>

          {/* Decorative card */}
          <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Platform Stats</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-emerald-400 text-xs font-semibold">Live</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[['500+', 'Gigs'], ['2K+', 'Workers'], ['98%', 'Success']].map(([n, l]) => (
                <div key={l} className="text-center">
                  <p className="text-white text-xl font-extrabold">{n}</p>
                  <p className="text-slate-500 text-xs">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="relative text-slate-700 text-sm">© 2025 GigXpress · Trusted across India</p>
      </div>

      {/* ── RIGHT PANEL — form ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
              <Briefcase size={15} className="text-white" />
            </div>
            <span className="text-lg font-extrabold text-slate-900">Gig<span className="text-indigo-600">Xpress</span></span>
          </div>
          <button onClick={() => navigate('/')} aria-label="Go back to home"
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Desktop back link */}
        <div className="hidden lg:flex p-10 pb-0">
          <button onClick={() => navigate('/')} aria-label="Go back to home"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 text-sm font-semibold transition-colors group">
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to home
          </button>
        </div>

        {/* Form centred */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">

            {/* Heading */}
            <div className="mb-9">
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Sign in to your account</h1>
              <p className="text-slate-500 text-sm">Welcome back — enter your credentials below</p>
            </div>

            {/* Error */}
            {error && (
              <div role="alert" className="mb-6 bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={17} />
                <p className="text-sm text-red-700 font-semibold">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={17} />
                  <input
                    id="email" type="email" name="email"
                    value={formData.email} onChange={handleChange}
                    autoComplete="email" placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="text-sm font-bold text-slate-700">Password</label>
                  <button type="button" onClick={() => navigate('/forgot-password')}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold transition-colors">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={17} />
                  <input
                    id="password" type={showPassword ? 'text' : 'password'} name="password"
                    value={formData.password} onChange={handleChange}
                    autoComplete="current-password" placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm font-medium"
                  />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5">
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className={`w-full py-4 bg-indigo-600 text-white rounded-2xl font-extrabold text-base flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-indigo-200 mt-2 ${
                  loading
                    ? 'opacity-70 cursor-not-allowed'
                    : 'hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-indigo-300'
                }`}>
                {loading
                  ? <><Loader className="animate-spin" size={17} /> Signing in...</>
                  : 'Sign in →'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-xs text-slate-400 font-semibold">New to GigXpress?</span>
              </div>
            </div>

            <button onClick={() => navigate('/signup')}
              className="w-full py-3.5 border-2 border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 text-slate-700 rounded-2xl font-extrabold text-sm transition-all">
              Create a free account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;