import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, Mail, Lock, Eye, EyeOff,
  ArrowLeft, AlertCircle, Loader
} from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // 🔥 cookie support
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        // optional: store minimal user info
        localStorage.setItem('userRole', data.data.user.role);
        localStorage.setItem("userName", data.data.user.fullName);

        // redirect based on role
        if (data.data.user.role === 'organizer') {
          navigate('/organizer');
        } else {
          navigate('/volunteer');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="p-6 bg-white border-b">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-lg"
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

      {/* Main */}
      <main className="max-w-md mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back 👋
            </h2>
            <p className="text-gray-600">
              Login to your account to continue
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-600" size={20} />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 ${
                loading ? 'opacity-70' : 'hover:opacity-90'
              }`}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-sm text-gray-600 text-center mt-6">
            Don’t have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-indigo-600 font-semibold hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
