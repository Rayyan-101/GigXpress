import React, { useState, useEffect } from 'react';
import {
  Briefcase, Shield, MapPin, Star, TrendingUp, Users,
  CheckCircle, Clock, DollarSign, Award, ChevronRight,
  Menu, X, PlayCircle, ArrowRight, Zap, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─── Constants outside component ─────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL;

const ROLE_ROUTES = {
  organizer: '/organizer',
  worker: '/volunteer',
  admin: '/admin',
};

const TESTIMONIALS = [
  {
    name: 'Priya Sharma', role: 'Event Volunteer', initials: 'PS',
    gradient: 'from-pink-500 to-rose-600', rating: 5,
    text: 'GigXpress helped me earn ₹15,000 last month while managing my college schedule. The payment system is super secure!',
  },
  {
    name: 'Rahul Verma', role: 'Event Organizer', initials: 'RV',
    gradient: 'from-indigo-500 to-blue-600', rating: 5,
    text: 'Found reliable volunteers for my wedding event in just 2 days. The KYC verification gives me complete peace of mind.',
  },
  {
    name: 'Anita Desai', role: 'Marketing Volunteer', initials: 'AD',
    gradient: 'from-emerald-500 to-teal-600', rating: 5,
    text: 'The platform is so easy to use! I love the location-based job matching. Found gigs right in my neighborhood.',
  },
];

const FEATURES = [
  { icon: Shield, title: 'Secure Escrow Payments', description: 'Payments held safely until work is verified. Get paid every time, guaranteed.', accent: 'text-violet-600', bg: 'bg-violet-50', border: 'group-hover:border-violet-200' },
  { icon: CheckCircle, title: 'KYC Verified Users', description: 'All users are Aadhaar-verified. Work with confidence and accountability.', accent: 'text-emerald-600', bg: 'bg-emerald-50', border: 'group-hover:border-emerald-200' },
  { icon: MapPin, title: 'Location-Based Matching', description: 'Smart algorithm connects you to opportunities within your city.', accent: 'text-orange-600', bg: 'bg-orange-50', border: 'group-hover:border-orange-200' },
  { icon: Star, title: 'Rating & Review System', description: 'Two-way ratings build trust and help maintain quality on both sides.', accent: 'text-amber-600', bg: 'bg-amber-50', border: 'group-hover:border-amber-200' },
  { icon: Clock, title: 'Flexible Work Schedule', description: 'Pick gigs that suit your availability. Full control over your time.', accent: 'text-blue-600', bg: 'bg-blue-50', border: 'group-hover:border-blue-200' },
  { icon: Award, title: 'Proof of Work Verification', description: 'Upload completion proof for instant approval and guaranteed payout.', accent: 'text-rose-600', bg: 'bg-rose-50', border: 'group-hover:border-rose-200' },
];

const CATEGORIES = [
  { name: 'Event Management', icon: '🎪', count: '120+ Gigs', bar: 'w-3/4' },
  { name: 'Marketing',        icon: '📢', count: '85+ Gigs',  bar: 'w-2/3'  },
  { name: 'Hospitality',      icon: '🍽️', count: '95+ Gigs',  bar: 'w-4/5'  },
  { name: 'Technical',        icon: '💻', count: '70+ Gigs',  bar: 'w-1/2'  },
  { name: 'Creative Arts',    icon: '🎨', count: '60+ Gigs',  bar: 'w-2/5'  },
  { name: 'Logistics',        icon: '🚚', count: '50+ Gigs',  bar: 'w-1/3'  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Sign Up & Verify',      description: 'Create your account and complete KYC in minutes.',              icon: Users,        color: 'from-violet-500 to-purple-600' },
  { step: '02', title: 'Find Perfect Gigs',     description: 'Browse location-based opportunities matching your skills.',     icon: MapPin,       color: 'from-indigo-500 to-blue-600'   },
  { step: '03', title: 'Apply & Get Selected',  description: 'Submit applications and get hired by verified organizers.',     icon: CheckCircle,  color: 'from-emerald-500 to-teal-600'  },
  { step: '04', title: 'Complete & Earn',       description: 'Upload proof of work and receive secure escrow payment.',       icon: DollarSign,   color: 'from-orange-500 to-amber-600'  },
];

const STATS = [
  { number: '500+',   label: 'Active Gigs'  },
  { number: '2,000+', label: 'Volunteers'   },
  { number: '98%',    label: 'Success Rate' },
  { number: '₹50L+',  label: 'Paid Out'    },
];

// ─── Component ────────────────────────────────────────────────────────────────
const Home = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  // Inject Plus Jakarta Sans font
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { if (document.head.contains(link)) document.head.removeChild(link); };
  }, []);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Testimonial cycle
  useEffect(() => {
    const id = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(id);
  }, []);

  // Auth check
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/auth/me`, { credentials: 'include' });
        const data = await res.json();
        if (res.ok && data.success) { setIsLoggedIn(true); setUser(data.user); }
        else { setIsLoggedIn(false); setUser(null); }
      } catch { setIsLoggedIn(false); }
      finally { setLoadingAuth(false); }
    })();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${BASE_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
      setIsLoggedIn(false);
      setUser(null);
      sessionStorage.clear();
      navigate('/');
    } catch (err) { console.error('Logout failed', err); }
  };

  const getDashboardPath = () => ROLE_ROUTES[user?.role] || '/';
  const handleDashboardClick = () => navigate(getDashboardPath());
  const handleGetStarted = () => (isLoggedIn ? handleDashboardClick() : navigate('/login'));

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="min-h-screen bg-white">

      {/* ── NAV ──────────────────────────────────────────────────────────── */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg shadow-black/5' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">

            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-300/40">
                <Briefcase className="text-white" size={17} />
              </div>
              <span className={`text-xl font-extrabold tracking-tight transition-colors ${scrolled ? 'text-slate-900' : 'text-white'}`}>
                Gig<span className={scrolled ? 'text-indigo-600' : 'text-indigo-300'}>Xpress</span>
              </span>
            </div>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-7">
              {[['Features', '#features'], ['How It Works', '#how-it-works'], ['Categories', '#categories'], ['Reviews', '#testimonials']].map(([label, href]) => (
                <a key={href} href={href}
                  className={`text-sm font-semibold transition-colors ${scrolled ? 'text-slate-600 hover:text-indigo-600' : 'text-white/80 hover:text-white'}`}>
                  {label}
                </a>
              ))}
            </div>

            {/* Auth actions */}
            <div className="hidden md:flex items-center gap-3">
              {!isLoggedIn ? (
                <>
                  <button onClick={() => navigate('/login')}
                    className={`text-sm font-bold px-3 py-2 rounded-lg transition-colors ${scrolled ? 'text-slate-700 hover:text-indigo-600' : 'text-white/90 hover:text-white'}`}>
                    Log in
                  </button>
                  <button onClick={() => navigate('/signup')}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5">
                    Get Started →
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleDashboardClick}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all">
                    Dashboard
                  </button>
                  <button onClick={handleLogout}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${scrolled ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-white/20 text-white hover:bg-white/10'}`}>
                    Log out
                  </button>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileMenuOpen(p => !p)}
              className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? 'hover:bg-gray-100 text-slate-700' : 'text-white hover:bg-white/10'}`}>
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-xl px-4 py-5 space-y-3">
            {[['Features', '#features'], ['How It Works', '#how-it-works'], ['Categories', '#categories'], ['Reviews', '#testimonials']].map(([label, href]) => (
              <a key={href} href={href} onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-700 text-sm font-semibold hover:text-indigo-600 transition-colors">
                {label}
              </a>
            ))}
            <div className="pt-2 space-y-2">
              {!isLoggedIn ? (
                <>
                  <button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                    className="w-full py-3 border border-gray-200 text-slate-700 rounded-xl text-sm font-bold">Log in</button>
                  <button onClick={() => { navigate('/signup'); setMobileMenuOpen(false); }}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold">Get Started</button>
                </>
              ) : (
                <>
                  <button onClick={() => { handleDashboardClick(); setMobileMenuOpen(false); }}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold">Dashboard</button>
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="w-full py-3 border border-red-200 text-red-500 rounded-xl text-sm font-bold">Log out</button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen bg-slate-950 flex items-center overflow-hidden">
        {/* Ambient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-indigo-600/25 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-violet-600/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left — copy */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-400/20 rounded-full mb-8">
                <Zap size={13} className="text-amber-400" />
                <span className="text-indigo-300 text-sm font-semibold tracking-wide">India's Fastest-Growing Gig Platform</span>
              </div>

              <h1 className="text-5xl lg:text-[5.5rem] font-black text-white leading-[1.0] tracking-tight mb-7">
                Your Next<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400">
                  Gig Starts
                </span><br />
                Here
              </h1>

              <p className="text-slate-400 text-xl leading-relaxed mb-10 max-w-lg">
                Connect with verified organizers, work on your terms, and earn securely with escrow-protected payments.
              </p>

              <div className="flex flex-wrap gap-4 mb-16">
                <button onClick={handleGetStarted}
                  className="group px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-base flex items-center gap-2.5 transition-all shadow-2xl shadow-indigo-900/60 hover:-translate-y-1 hover:shadow-indigo-900/80">
                  Start Earning Today
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-8 py-4 border border-white/10 hover:border-white/25 hover:bg-white/5 text-white rounded-2xl font-bold text-base flex items-center gap-2.5 transition-all">
                  <PlayCircle size={18} className="text-indigo-400" /> Watch Demo
                </button>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-white/5">
                {STATS.map((s, i) => (
                  <div key={i}>
                    <div className="text-2xl lg:text-3xl font-extrabold text-white">{s.number}</div>
                    <div className="text-slate-500 text-xs mt-0.5 font-medium uppercase tracking-wider">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — floating UI mockup */}
            <div className="hidden lg:block relative h-[540px]">
              {/* Main gig card */}
              <div className="absolute top-0 right-4 w-80 bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-xl">🎪</span>
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Wedding Event Staff</p>
                      <p className="text-slate-400 text-xs mt-0.5">Mumbai, Maharashtra</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-semibold">Live</span>
                </div>
                <div className="flex items-center justify-between mb-5 py-4 border-y border-white/5">
                  <div>
                    <p className="text-slate-400 text-xs">Daily Pay</p>
                    <p className="text-white text-xl font-extrabold">₹1,200</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Duration</p>
                    <p className="text-white text-xl font-extrabold">3 Days</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Slots Left</p>
                    <p className="text-amber-400 text-xl font-extrabold">4</p>
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  {['Hospitality', 'KYC'].map(tag => (
                    <span key={tag} className="px-3 py-1 bg-indigo-500/15 text-indigo-300 rounded-full text-xs font-medium">{tag}</span>
                  ))}
                </div>
                <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-colors">
                  Apply Now →
                </button>
              </div>

              {/* Earnings card */}
              <div className="absolute top-48 left-0 w-60 bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl">
                <p className="text-slate-400 text-xs font-medium mb-1 uppercase tracking-wider">This Month</p>
                <p className="text-white text-3xl font-extrabold mb-3">₹18,400</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-indigo-500 to-violet-400 rounded-full" />
                  </div>
                  <span className="text-emerald-400 text-xs font-bold">+24%</span>
                </div>
              </div>

              {/* Live badge */}
              <div className="absolute bottom-28 right-8 bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-3 shadow-xl">
                <div className="relative">
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />
                  <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-60" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">247 gigs live</p>
                  <p className="text-slate-500 text-xs">Updated just now</p>
                </div>
              </div>

              {/* Escrow badge */}
              <div className="absolute bottom-6 left-4 bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-3 shadow-xl">
                <Shield size={20} className="text-amber-400" />
                <div>
                  <p className="text-white text-sm font-bold">Escrow Protected</p>
                  <p className="text-slate-500 text-xs">100% payment guarantee</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF BAR ─────────────────────────────────────────────── */}
      <div className="bg-indigo-600 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-2 text-white/90 text-sm font-semibold">
            {['✓ KYC Verified Workers', '✓ Escrow Payment Protection', '✓ Real-Time Chat', '✓ Instant Payout'].map(item => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <p className="text-indigo-600 font-bold text-sm uppercase tracking-widest mb-3">Why GigXpress</p>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
              Built for the<br />gig economy
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              Every feature is designed to make freelance work safer, faster, and more rewarding.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i} className={`group bg-white border-2 border-gray-100 ${f.border} rounded-2xl p-7 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-default`}>
                <div className={`w-14 h-14 ${f.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className={f.accent} size={26} />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-28 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #818cf8 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-indigo-400 font-bold text-sm uppercase tracking-widest mb-3">Process</p>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-4">How It Works</h2>
            <p className="text-slate-400 text-xl">Get started in 4 simple steps</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {HOW_IT_WORKS.map((s, i) => (
              <div key={i} className="relative group text-center">
                <div className="relative inline-block mb-6">
                  <div className={`w-20 h-20 bg-gradient-to-br ${s.color} rounded-3xl flex items-center justify-center mx-auto shadow-2xl group-hover:-translate-y-2 transition-transform duration-300`}>
                    <s.icon className="text-white" size={30} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-white text-slate-900 rounded-full text-xs font-extrabold flex items-center justify-center shadow-lg">
                    {i + 1}
                  </div>
                </div>
                <p className="text-slate-600 text-xs font-bold tracking-widest uppercase mb-2">{s.step}</p>
                <h3 className="text-lg font-extrabold text-white mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.description}</p>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-9 -right-4 text-slate-700">
                    <ChevronRight size={28} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────────────────── */}
      <section id="categories" className="py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-indigo-600 font-bold text-sm uppercase tracking-widest mb-3">Categories</p>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-4">Popular Gig Types</h2>
            <p className="text-slate-500 text-xl">Find opportunities that match your skills</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {CATEGORIES.map((cat, i) => (
              <div key={i} className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div className="flex items-start justify-between mb-5">
                  <span className="text-4xl">{cat.icon}</span>
                  <ArrowRight size={18} className="text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all mt-1" />
                </div>
                <h3 className="text-slate-900 font-extrabold text-base mb-1">{cat.name}</h3>
                <p className="text-indigo-600 font-bold text-sm mb-4">{cat.count}</p>
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${cat.bar} bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section id="testimonials" className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-indigo-600 font-bold text-sm uppercase tracking-widest mb-3">Reviews</p>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-4">What Our Users Say</h2>
            <p className="text-slate-500 text-xl">Trusted by thousands across India</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} onClick={() => setActiveTestimonial(i)}
                className={`rounded-2xl p-7 border-2 cursor-pointer transition-all duration-300 ${
                  activeTestimonial === i
                    ? 'border-indigo-500 shadow-2xl shadow-indigo-100 bg-white -translate-y-2'
                    : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-lg'
                }`}>
                <div className="flex gap-1 mb-5">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={15} className="text-amber-400" fill="currentColor" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white font-extrabold text-xs`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-slate-900 font-bold text-sm">{t.name}</p>
                    <p className="text-slate-400 text-xs">{t.role}</p>
                  </div>
                  {activeTestimonial === i && (
                    <div className="ml-auto w-2 h-2 bg-indigo-500 rounded-full" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="flex gap-2 justify-center mt-8">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)}
                className={`rounded-full transition-all duration-300 ${i === activeTestimonial ? 'w-6 h-2 bg-indigo-600' : 'w-2 h-2 bg-gray-200'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-28 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-400/20 rounded-full mb-8">
            <Sparkles size={13} className="text-amber-400" />
            <span className="text-indigo-300 text-sm font-semibold">Join 2,000+ workers already earning</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-black text-white mb-5 leading-tight">
            Ready to Start<br />Your Journey?
          </h2>
          <p className="text-slate-400 text-xl mb-12">Sign up free and find your first gig today</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={handleGetStarted}
              className="group px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-extrabold text-lg flex items-center justify-center gap-2.5 transition-all shadow-2xl shadow-indigo-900/50 hover:-translate-y-1">
              Get Started Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 border-2 border-white/10 hover:border-white/25 hover:bg-white/5 text-white rounded-2xl font-extrabold text-lg transition-all">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-black py-14 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
                  <Briefcase size={15} className="text-white" />
                </div>
                <span className="text-base font-extrabold text-white">Gig<span className="text-indigo-400">Xpress</span></span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">Your trusted platform for event-based opportunities across India.</p>
            </div>
            {[
              { title: 'Platform', links: ['About Us', 'How It Works', 'Contact'] },
              { title: 'Legal', links: ['Terms of Service', 'Privacy Policy'] },
              { title: 'Connect', links: ['Twitter', 'Instagram', 'LinkedIn'] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map(link => (
                    <li key={link}><a href="#" className="text-slate-600 hover:text-white text-sm transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-white/5 text-center">
            <p className="text-slate-700 text-sm">© 2025 GigXpress. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

