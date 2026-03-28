import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, Users, ArrowLeft, Eye, EyeOff,
  CheckCircle, Mail, Lock, User, Phone, MapPin,
  Building, Calendar, Shield, AlertCircle, Loader
} from 'lucide-react';

const CompleteRegistrationFlow = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState('role-selection');
  const [selectedRole, setSelectedRole] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    organizationType: '',
    gstNumber: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    location: '',
    skills: [],
    experience: ''
  });

  const roles = [
    {
      id: 'organizer',
      title: "I'm an organizer, hiring for events",
      icon: <Briefcase size={24} />,
    },
    {
      id: 'worker',
      title: "I'm a volunteer, looking for gigs",
      icon: <Users size={24} />,
    },
  ];

  const skillOptions = [
    'Event Management', 'Hospitality', 'Marketing',
    'Technical Support', 'AV Setup', 'Crowd Management',
    'Registration Desk', 'Photography', 'Decoration'
  ];

  const handleRoleSelection = (roleId) => {
    setSelectedRole(roleId);
    setError('');
  };

  const handleContinue = () => {
    if (selectedRole === 'organizer') setStep('organizer-form');
    else if (selectedRole === 'worker') setStep('worker-form');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const toggleSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const validateForm = () => {
    // --- Common validation ---
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
    const cleanPhone = formData.phone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      setError('Please enter a valid Indian phone number (e.g. +91 98765 43210)');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }

    const password = formData.password;
    const confirmPassword = formData.confirmPassword;


    if (password !== confirmPassword) {
      console.log("❌ PASSWORD MISMATCH TRIGGERED");
      setError('Passwords do not match');
      return false;
    }

    // --- Organizer-specific ---
    if (selectedRole === 'organizer') {
      if (!formData.organizationName.trim()) {
        setError('Organization name is required');
        return false;
      }
      if (!formData.organizationType) {
        setError('Please select an organization type');
        return false;
      }
      if (!formData.address.trim()) {
        setError('Business address is required');
        return false;
      }
    }

    // --- Worker-specific ---
    if (selectedRole === 'worker') {
      if (!formData.dateOfBirth) {
        setError('Date of birth is required');
        return false;
      }

      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
      if (age < 18) {
        setError('You must be at least 18 years old to register');
        return false;
      }

      if (!formData.gender) {
        setError('Please select your gender');
        return false;
      }

      if (!formData.location.trim()) {
        setError('Location (city) is required');
        return false;
      }

      if (formData.skills.length === 0) {
        setError('Please select at least one skill');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      // Strip confirmPassword before sending — backend doesn't need it stored
      const { confirmPassword, ...payload } = formData;

      const response = await fetch(`${API_URL}/api/auth/register/${selectedRole}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        // Save auth info to localStorage
        localStorage.setItem('userRole',  data.data.user.role);
        localStorage.setItem('userId',    String(data.data.user.id));
        localStorage.setItem('userEmail', data.data.user.email);
        localStorage.setItem('userName',  data.data.user.fullName);

        setStep('verification');
      } else {
        // Show exact error message from backend (e.g. "Email already registered")
        setError(data.message || 'Registration failed. Please try again.');

        // If backend returned field-level validation errors, show the first one
        if (data.errors && data.errors.length > 0) {
          setError(data.errors[0].msg);
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Unable to connect to server. Please make sure the backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };


  // ─────────────────────────────────────────────────────────────────────────
  // SCREEN 1 — Role Selection
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 'role-selection') {
    return (
      <div className="min-h-screen bg-white font-sans">
        <header className="p-6 border-b">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Briefcase className="text-white" size={20} />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                GigXpress
              </h1>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 pt-12 flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-3 text-center text-gray-900">
            Join as an organizer or volunteer
          </h2>
          <p className="text-gray-600 mb-10 text-center">
            Choose your role to get started with GigXpress
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-10">
            {roles.map((role) => (
              <div
                key={role.id}
                onClick={() => handleRoleSelection(role.id)}
                className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 group flex flex-col h-48
                  ${selectedRole === role.id
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="absolute top-4 right-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                    ${selectedRole === role.id
                      ? 'border-indigo-600 bg-indigo-600'
                      : 'border-gray-300 group-hover:border-gray-400'
                    }`}
                  >
                    {selectedRole === role.id && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </div>

                <div className={`mb-4 ${selectedRole === role.id ? 'text-indigo-600' : 'text-gray-700'}`}>
                  {role.icon}
                </div>

                <h3 className="text-xl font-semibold leading-tight pr-4 text-gray-900">
                  {role.title}
                </h3>
              </div>
            ))}
          </div>

          <button
            disabled={!selectedRole}
            onClick={handleContinue}
            className={`px-8 py-3 rounded-lg font-semibold transition-all mb-6 w-full md:w-auto min-w-[200px]
              ${selectedRole
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
          >
            {selectedRole === 'organizer'
              ? 'Continue as Organizer'
              : selectedRole === 'worker'
              ? 'Continue as Volunteer'
              : 'Create Account'}
          </button>

          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-indigo-600 font-semibold hover:underline"
            >
              Log In
            </button>
          </p>
        </main>
      </div>
    );
  }


  // ─────────────────────────────────────────────────────────────────────────
  // SCREEN 2A — Organizer Registration Form
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 'organizer-form') {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <header className="p-6 bg-white border-b">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <button
              onClick={() => { setStep('role-selection'); setError(''); }}
              className="p-2 hover:bg-gray-100 rounded-lg"
              disabled={loading}
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Briefcase className="text-white" size={20} />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                GigXpress
              </h1>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Organizer Registration</h2>
              <p className="text-gray-600">Create your organizer account to start hiring talent</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User size={20} /> Personal Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      placeholder="John Doe"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="john@example.com"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="+91 98765 43210"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Organization Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building size={20} /> Organization Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Organization Name *</label>
                    <input
                      type="text"
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="ABC Events Pvt. Ltd."
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Organization Type *</label>
                      <select
                        name="organizationType"
                        value={formData.organizationType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                        disabled={loading}
                      >
                        <option value="">Select type</option>
                        <option value="company">Company</option>
                        <option value="individual">Individual</option>
                        <option value="ngo">NGO</option>
                        <option value="educational">Educational Institution</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">GST Number (Optional)</label>
                      <input
                        type="text"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="22AAAAA0000A1Z5"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Business Address *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        rows="3"
                        placeholder="Street address, City, State, PIN"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Lock size={20} /> Create Password
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Min. 8 characters"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Re-enter password"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="mt-1" required disabled={loading} />
                  <span className="text-sm text-gray-700">
                    I agree to the{' '}
                    <a href="#" className="text-indigo-600 font-semibold hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-indigo-600 font-semibold hover:underline">Privacy Policy</a>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2
                  ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}`}
              >
                {loading ? (
                  <><Loader className="animate-spin" size={20} /> Creating Account...</>
                ) : (
                  'Create Organizer Account'
                )}
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }


  // ─────────────────────────────────────────────────────────────────────────
  // SCREEN 2B — Volunteer / Worker Registration Form
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 'worker-form') {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <header className="p-6 bg-white border-b">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <button
              onClick={() => { setStep('role-selection'); setError(''); }}
              className="p-2 hover:bg-gray-100 rounded-lg"
              disabled={loading}
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Briefcase className="text-white" size={20} />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                GigXpress
              </h1>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Volunteer Registration</h2>
              <p className="text-gray-600">Create your account to start finding gigs</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User size={20} /> Personal Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Priya Sharma"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="priya@example.com"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="+91 98765 43210"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth *</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                          required
                          disabled={loading}
                          max={new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                            .toISOString()
                            .split('T')[0]}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Gender *</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                        disabled={loading}
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location (City) *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Pune, Maharashtra"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills & Experience */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills & Experience</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Select Your Skills * (at least one)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {skillOptions.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          disabled={loading}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition
                            ${formData.skills.includes(skill)
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }
                            ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                    {formData.skills.length > 0 && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ {formData.skills.length} skill{formData.skills.length > 1 ? 's' : ''} selected
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Previous Experience</label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      disabled={loading}
                    >
                      <option value="">Select experience level</option>
                      <option value="beginner">Beginner (0-5 gigs)</option>
                      <option value="intermediate">Intermediate (6-15 gigs)</option>
                      <option value="experienced">Experienced (16+ gigs)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Lock size={20} /> Create Password
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Min. 8 characters"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Re-enter password"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="mt-1" required disabled={loading} />
                  <span className="text-sm text-gray-700">
                    I agree to the{' '}
                    <a href="#" className="text-indigo-600 font-semibold hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-indigo-600 font-semibold hover:underline">Privacy Policy</a>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2
                  ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}`}
              >
                {loading ? (
                  <><Loader className="animate-spin" size={20} /> Creating Account...</>
                ) : (
                  'Create Volunteer Account'
                )}
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }


  // ─────────────────────────────────────────────────────────────────────────
  // SCREEN 3 — Registration Success
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 'verification') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={40} />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">Registration Successful!</h2>

          <p className="text-gray-600 mb-8">
            Your account has been created successfully. Welcome to GigXpress!
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="text-yellow-600 flex-shrink-0 mt-1" size={20} />
              <div className="text-left text-sm text-yellow-800">
                <p className="font-semibold mb-1">Next Step: KYC Verification</p>
                <p>
                  Complete your Aadhaar verification to start{' '}
                  {selectedRole === 'organizer' ? 'posting jobs' : 'applying for gigs'}.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(selectedRole === 'organizer' ? '/organizer' : '/volunteer')}
            className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition mb-3"
          >
            Go to Dashboard
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Back to Home
          </button>

          <p className="text-sm text-gray-500 mt-6">
            You can complete KYC verification later from your profile settings.
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default CompleteRegistrationFlow;