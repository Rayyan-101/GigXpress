import React, { useState } from 'react';
import { 
  Briefcase, Users, ArrowLeft, Eye, EyeOff, 
  CheckCircle, Mail, Lock, User, Phone, MapPin,
  Building, Calendar, Upload, Shield, ArrowRight
} from 'lucide-react';

const CompleteRegistrationFlow = () => {
  const [step, setStep] = useState('role-selection'); 
  const [selectedRole, setSelectedRole] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Logic Handlers
  const handleRoleSelection = (roleId) => setSelectedRole(roleId);
  
  const handleContinue = () => {
    if (selectedRole === 'organizer') setStep('organizer-form');
    else if (selectedRole === 'worker') setStep('worker-form');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    setIsSubmitting(true);
    // Mock API Call
    setTimeout(() => {
      console.log('Submitting:', { role: selectedRole, ...formData });
      setIsSubmitting(false);
      setStep('verification');
    }, 1500);
  };

  // --- RENDER LOGIC ---

  // 1. Role Selection Screen (Already mostly complete in your snippet)
  if (step === 'role-selection') {
    return (
      <div className="min-h-screen bg-white font-sans">
        <header className="p-6 border-b">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white">
              <Briefcase size={20} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              GigXpress
            </h1>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-6 pt-12 flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-3 text-center text-gray-900">Join as an organizer or volunteer</h2>
          <p className="text-gray-600 mb-10 text-center">Choose your role to get started with GigXpress</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-10">
            {roles.map((role) => (
              <div
                key={role.id}
                onClick={() => handleRoleSelection(role.id)}
                className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all group flex flex-col h-48
                  ${selectedRole === role.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="absolute top-4 right-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                    ${selectedRole === role.id ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'}`}>
                    {selectedRole === role.id && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>
                <div className={`mb-4 ${selectedRole === role.id ? 'text-indigo-600' : 'text-gray-700'}`}>{role.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900">{role.title}</h3>
              </div>
            ))}
          </div>
          <button
            disabled={!selectedRole}
            onClick={handleContinue}
            className={`px-8 py-3 rounded-lg font-semibold transition-all mb-6 w-full md:w-auto min-w-[240px]
              ${selectedRole ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            Continue as {selectedRole ? selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1) : '...'}
          </button>

          <p className="text-sm">
          Already have an account?{' '}
          <a href="#" className="text-[#108a00] underline hover:no-underline">Log In</a>
        </p>
        </main>
      </div>
    );
  }

  // 2. Form Rendering (Organizer/Worker - Simplified for brevity, reusing your logic)
  if (step === 'organizer-form' || step === 'worker-form') {
    const isOrganizer = step === 'organizer-form';
    return (
      <div className="min-h-screen bg-gray-50 font-sans pb-12">
        <header className="p-6 bg-white border-b mb-8">
          <div className="max-w-4xl mx-2 flex items-center gap-4">
            <button onClick={() => setStep('role-selection')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-indigo-600">GigXpress Registration</h1>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold mb-6">Complete your {isOrganizer ? 'Organizer' : 'Volunteer'} Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input name="fullName" onChange={handleInputChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Enter name" required />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input name="email" type="email" onChange={handleInputChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="email@example.com" required />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input name="phone" type="tel" onChange={handleInputChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="+91..." required />
                 </div>
              </div>

              {/* Conditional Fields: Organizer */}
              {isOrganizer && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-gray-800">Organization Details</h3>
                  <input name="organizationName" onChange={handleInputChange} className="w-full p-3 border rounded-lg outline-none" placeholder="Company Name" required />
                  <textarea name="address" onChange={handleInputChange} className="w-full p-3 border rounded-lg outline-none" placeholder="Business Address" rows="2" required />
                </div>
              )}

              {/* Conditional Fields: Worker */}
              {!isOrganizer && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-gray-800">Skills & Location</h3>
                  <div className="flex flex-wrap gap-2">
                    {skillOptions.map(skill => (
                      <button key={skill} type="button" onClick={() => toggleSkill(skill)} className={`px-3 py-1 text-sm rounded-full border transition-colors ${formData.skills.includes(skill) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 hover:border-indigo-600'}`}>
                        {skill}
                      </button>
                    ))}
                  </div>
                  <input name="location" onChange={handleInputChange} className="w-full p-3 border rounded-lg outline-none" placeholder="Current City" required />
                </div>
              )}

              {/* Passwords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="relative">
                  <input name="password" type={showPassword ? "text" : "password"} onChange={handleInputChange} className="w-full p-3 border rounded-lg outline-none" placeholder="Password" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <input name="confirmPassword" type="password" onChange={handleInputChange} className="w-full p-3 border rounded-lg outline-none" placeholder="Confirm Password" required />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Processing..." : `Create ${isOrganizer ? 'Organizer' : 'Volunteer'} Account`}
                {!isSubmitting && <ArrowRight size={20} />}
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // 3. FINAL STEP: Verification Success Screen
  if (step === 'verification') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 max-w-lg w-full text-center border border-gray-100">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <CheckCircle className="text-green-600" size={48} />
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            You're all set, {formData.fullName.split(' ')[0]}!
          </h2>

          <p className="text-gray-600 mb-8 leading-relaxed">
            We've sent a verification link to <span className="font-semibold text-indigo-600">{formData.email}</span>. 
            Please verify your email to activate your dashboard.
          </p>

          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-8 text-left">
            <div className="flex items-start gap-4">
              <div className="bg-indigo-600 p-2 rounded-lg mt-1">
                <Shield className="text-white" size={20} />
              </div>
              <div>
                <p className="font-bold text-indigo-900 mb-1">Boost your Profile</p>
                <p className="text-sm text-indigo-700">
                  Complete your **Aadhaar/KYC** verification now to get a 
                  verified badge and start {selectedRole === 'organizer' ? 'hiring workers' : 'applying for premium gigs'} immediately.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={() => alert("Redirecting to KYC flow...")}
              className="w-full px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all transform hover:-translate-y-1 shadow-indigo-200 shadow-lg"
            >
              Start KYC Verification
            </button>
            
            <button 
              onClick={() => setStep('role-selection')}
              className="w-full px-8 py-4 bg-white text-gray-600 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>

          <p className="mt-8 text-sm text-gray-400">
            Didn't receive the email? <button className="text-indigo-600 font-bold hover:underline">Resend Email</button>
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default CompleteRegistrationFlow;