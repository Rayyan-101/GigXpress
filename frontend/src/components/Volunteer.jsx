import React, { useState } from 'react';
import { 
  Briefcase, Star, MapPin, Calendar, DollarSign, Award, 
  TrendingUp, CheckCircle, Clock, Filter, Search, Eye,
  Heart, Share2, MessageSquare, Bell, Menu, X, ChevronRight,
  Target, Trophy, Zap, Download, Settings, Upload
} from 'lucide-react';

const WorkerDashboard = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const stats = [
    { label: 'Total Earnings', value: '₹25,400', icon: DollarSign, color: 'from-green-500 to-green-600', change: '+₹4.2k' },
    { label: 'Completed Gigs', value: '18', icon: CheckCircle, color: 'from-blue-500 to-blue-600', change: '+3' },
    { label: 'Trust Score', value: '4.8', icon: Star, color: 'from-yellow-500 to-yellow-600', change: '+0.2' },
    { label: 'Skill Badges', value: '8', icon: Award, color: 'from-purple-500 to-purple-600', change: '+2' }
  ];

  const availableJobs = [
    {
      id: 1,
      title: 'Wedding Event Staff Required',
      organizer: 'Premium Events Co.',
      organizerRating: 4.9,
      location: 'Pune, Koregaon Park',
      distance: '2.3 km',
      date: '2025-02-15',
      duration: 'Full Day (8 hours)',
      pay: '₹1,500',
      workers: '8 needed',
      skills: ['Event Management', 'Hospitality'],
      verified: true,
      urgent: false
    },
    {
      id: 2,
      title: 'Marketing Campaign Volunteers',
      organizer: 'TechStart India',
      organizerRating: 4.7,
      location: 'PCMC, Akurdi',
      distance: '5.1 km',
      date: '2025-02-10',
      duration: 'Half Day (4 hours)',
      pay: '₹800',
      workers: '5 needed',
      skills: ['Marketing', 'Communication'],
      verified: true,
      urgent: true
    },
    {
      id: 3,
      title: 'Tech Conference Setup',
      organizer: 'Innovation Summit',
      organizerRating: 4.8,
      location: 'Pune, Hinjewadi',
      distance: '8.7 km',
      date: '2025-02-20',
      duration: 'Full Day (8 hours)',
      pay: '₹2,000',
      workers: '4 needed',
      skills: ['Technical', 'AV Support'],
      verified: true,
      urgent: false
    }
  ];

  const myApplications = [
    {
      id: 1,
      title: 'College Fest Volunteer',
      organizer: 'DY Patil College',
      date: '2025-02-05',
      pay: '₹1,200',
      status: 'Accepted',
      appliedDate: '2025-01-18'
    },
    {
      id: 2,
      title: 'Product Launch Event',
      organizer: 'StartupXYZ',
      date: '2025-02-12',
      pay: '₹1,500',
      status: 'Pending',
      appliedDate: '2025-01-22'
    }
  ];

  const completedGigs = [
    {
      id: 1,
      title: 'New Year Party Staff',
      organizer: 'Elite Events',
      date: '2025-01-01',
      earned: '₹2,000',
      rating: 5,
      review: 'Excellent work! Very professional and punctual.'
    },
    {
      id: 2,
      title: 'Corporate Conference',
      organizer: 'Tech Solutions Ltd',
      date: '2024-12-20',
      earned: '₹1,800',
      rating: 4.5,
      review: 'Great job! Would hire again.'
    }
  ];

  const badges = [
    { name: 'Event Pro', icon: '🎪', color: 'bg-blue-100 text-blue-700', earned: '2024-12-15' },
    { name: 'Reliable Worker', icon: '⭐', color: 'bg-yellow-100 text-yellow-700', earned: '2024-11-20' },
    { name: 'Top Rated', icon: '🏆', color: 'bg-purple-100 text-purple-700', earned: '2025-01-10' },
    { name: 'Marketing Expert', icon: '📢', color: 'bg-green-100 text-green-700', earned: '2024-10-05' },
    { name: 'Quick Learner', icon: '⚡', color: 'bg-orange-100 text-orange-700', earned: '2024-09-12' },
    { name: 'Team Player', icon: '🤝', color: 'bg-indigo-100 text-indigo-700', earned: '2024-08-30' }
  ];

  const progressLevels = [
    { level: 'Beginner', gigs: '0-5', current: false },
    { level: 'Volunteer', gigs: '6-15', current: false },
    { level: 'Regular', gigs: '16-30', current: true },
    { level: 'Professional', gigs: '31-50', current: false },
    { level: 'Expert', gigs: '51+', current: false }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Menu size={24} />
              </button>
              <div className="flex items-center gap-2 group cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center transition-transform group-hover:rotate-6">
                  <Briefcase className="text-white" size={20} />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  GigXpress
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-full transition-all hover:scale-110">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="flex items-center gap-3 pl-4 border-l hover:bg-gray-50 p-1 rounded-lg cursor-pointer transition-colors">
                <img src="https://i.pravatar.cc/150?img=5" alt="Profile" className="w-10 h-10 rounded-full border-2 border-transparent hover:border-indigo-500 transition-all" />
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold">Priya Sharma</p>
                  <p className="text-xs text-gray-500">Regular Worker</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none`}>
          <div className="p-6 space-y-6 pt-4">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 text-white shadow-lg transform transition-transform hover:scale-[1.02]">
              <div className="flex items-center gap-2 mb-2">
                <Trophy size={20} className="animate-pulse" />
                <span className="font-semibold">Regular Worker</span>
              </div>
              <div className="text-sm mb-3">12 more gigs to reach Professional level!</div>
              <div className="w-full bg-white/30 rounded-full h-2">
                <div className="bg-white h-2 rounded-full transition-all duration-1000" style={{ width: '60%' }}></div>
              </div>
            </div>

            <nav className="space-y-2">
              {[
                { id: 'browse', label: 'Browse Gigs', icon: Search },
                { id: 'applications', label: 'My Applications', icon: Clock },
                { id: 'scheduled', label: 'Scheduled', icon: Calendar },
                { id: 'completed', label: 'Completed', icon: CheckCircle },
                { id: 'portfolio', label: 'My Portfolio', icon: Award },
                { id: 'earnings', label: 'Earnings', icon: DollarSign }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 group ${
                    activeTab === item.id 
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                    : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
                >
                  <item.icon size={20} className={`transition-transform duration-200 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeTab === 'browse' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Browse Available Gigs</h1>
                <p className="text-gray-600 mt-1">Find opportunities that match your skills</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                  <div key={i} className="group bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-transparent hover:border-indigo-100">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-12`}>
                        <stat.icon size={24} />
                      </div>
                      <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">{stat.change}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-indigo-600" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search by title, location, or skills..." 
                    className="pl-10 pr-4 py-3 border rounded-lg w-full focus:ring-2 focus:ring-indigo-500 transition-all outline-none bg-white hover:border-indigo-300 shadow-sm" 
                  />
                </div>
                <button className="px-6 py-3 border rounded-lg hover:bg-white hover:text-indigo-600 hover:border-indigo-600 flex items-center gap-2 transition-all duration-200 shadow-sm active:scale-95">
                  <Filter size={20} />
                  Filters
                </button>
              </div>

              <div className="grid gap-6">
                {availableJobs.map((job) => (
                  <div key={job.id} className="group bg-white rounded-xl shadow-md p-6 hover:shadow-2xl transition-all duration-300 border-l-4 border-transparent hover:border-indigo-500 transform hover:-translate-y-1">
                    {job.urgent && (
                      <div className="mb-4">
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold flex items-center gap-1 w-fit animate-pulse">
                          <Zap size={14} />
                          Urgent Hiring
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <span className="font-medium hover:underline cursor-pointer">{job.organizer}</span>
                              {job.verified && <CheckCircle size={16} className="text-green-600" title="Verified" />}
                              <div className="flex items-center gap-1">
                                <Star size={14} className="text-yellow-500 fill-current" />
                                <span className="font-semibold">{job.organizerRating}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-indigo-600 group-hover:scale-110 transition-transform origin-right">{job.pay}</p>
                            <p className="text-sm text-gray-500">per worker</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.skills.map((skill) => (
                            <span key={skill} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium hover:bg-indigo-100 transition-colors">
                              {skill}
                            </span>
                          ))}
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                            <MapPin size={16} className="text-indigo-600" />
                            <div>
                              <p className="font-medium">{job.location}</p>
                              <p className="text-xs text-gray-500">{job.distance} away</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-indigo-600" />
                            <div>
                              <p className="font-medium">{new Date(job.date).toLocaleDateString()}</p>
                              <p className="text-xs text-gray-500">{job.duration}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Briefcase size={16} className="text-indigo-600" />
                            <p className="font-medium">{job.workers}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-indigo-600" />
                            <p className="font-medium">Posted 2h ago</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex lg:flex-col gap-2">
                        <button className="flex-1 lg:flex-initial px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:brightness-110 hover:shadow-lg transition-all active:scale-95">
                          Apply Now
                        </button>
                        <button className="px-4 py-3 border rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-90" title="Preview">
                          <Eye size={20} />
                        </button>
                        <button className="px-4 py-3 border rounded-lg hover:bg-pink-50 hover:text-pink-600 transition-all active:scale-90" title="Save">
                          <Heart size={20} />
                        </button>
                        <button className="px-4 py-3 border rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-90" title="Share">
                          <Share2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>

              <div className="grid gap-6">
                {myApplications.map((app) => (
                  <div key={app.id} className="group bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border border-transparent hover:border-indigo-100">
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{app.title}</h3>
                            <p className="text-gray-600">{app.organizer}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold transition-transform group-hover:scale-110 ${
                            app.status === 'Accepted' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {app.status}
                          </span>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>{new Date(app.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign size={16} />
                            <span className="font-semibold">{app.pay}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={16} />
                            <span>Applied: {app.appliedDate}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex lg:flex-col gap-2">
                        {app.status === 'Accepted' && (
                          <button className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:brightness-110 shadow-md transition-all active:scale-95">
                            View Details
                          </button>
                        )}
                        <button className="px-6 py-2 border rounded-lg hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-600 transition-all flex items-center justify-center gap-2 active:scale-95">
                          <MessageSquare size={18} />
                          Message
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'completed' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">Completed Gigs</h1>

              <div className="grid gap-6">
                {completedGigs.map((gig) => (
                  <div key={gig.id} className="group bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-green-500">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">{gig.title}</h3>
                            <p className="text-gray-600">{gig.organizer}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600 group-hover:scale-110 transition-transform origin-right">{gig.earned}</p>
                            <p className="text-sm text-gray-500">Earned</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={18} 
                                className={`transition-all duration-300 hover:scale-125 ${i < Math.floor(gig.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-gray-700">{gig.rating}/5</span>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 group-hover:bg-green-50 transition-colors border border-transparent group-hover:border-green-100">
                          <p className="text-sm text-gray-600 italic">"{gig.review}"</p>
                        </div>

                        <p className="text-sm text-gray-500 mt-3">Completed on {new Date(gig.date).toLocaleDateString()}</p>
                      </div>

                      <div className="flex lg:flex-col gap-2">
                        <button className="px-6 py-2 border border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 shadow-sm">
                          <Download size={18} />
                          Certificate
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">My Digital Portfolio</h1>
                  <p className="text-gray-600 mt-1">Showcase your achievements and skills</p>
                </div>
                <button className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:brightness-110 hover:shadow-lg hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2">
                  <Share2 size={20} />
                  Share Portfolio
                </button>
              </div>

              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white shadow-xl transform transition-transform hover:scale-[1.01]">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative group">
                    <img src="https://i.pravatar.cc/150?img=5" alt="Profile" className="w-32 h-32 rounded-full border-4 border-white transition-transform group-hover:rotate-3" />
                    <button className="absolute bottom-0 right-0 p-2 bg-white text-indigo-600 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload size={16} />
                    </button>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-bold mb-2">Priya Sharma</h2>
                    <p className="text-white/90 mb-4">Event Management Specialist • Pune, Maharashtra</p>
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                      <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm hover:bg-white/20 transition-colors">
                        <p className="text-2xl font-bold">18</p>
                        <p className="text-xs text-white/80 uppercase">Completed Gigs</p>
                      </div>
                      <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm hover:bg-white/20 transition-colors">
                        <p className="text-2xl font-bold">4.8</p>
                        <p className="text-xs text-white/80 uppercase">Average Rating</p>
                      </div>
                      <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm hover:bg-white/20 transition-colors">
                        <p className="text-2xl font-bold">₹25,400</p>
                        <p className="text-xs text-white/80 uppercase">Total Earned</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Skill Badges</h3>
                  <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-semibold animate-bounce shadow-sm">
                    8 Badges Earned
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {badges.map((badge, i) => (
                    <div key={i} className={`group ${badge.color} rounded-xl p-6 text-center transition-all duration-300 hover:scale-105 hover:rotate-1 hover:shadow-lg cursor-pointer border border-transparent hover:border-white/50`}>
                      <div className="text-5xl mb-3 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12 drop-shadow-sm">{badge.icon}</div>
                      <h4 className="font-bold text-lg mb-1">{badge.name}</h4>
                      <p className="text-sm opacity-75">Earned: {new Date(badge.earned).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Career Progression</h3>
                <div className="space-y-4">
                  {progressLevels.map((level, i) => (
                    <div key={i} className={`flex items-center gap-4 p-3 rounded-xl transition-all ${level.current ? 'bg-indigo-50 shadow-sm' : 'hover:bg-gray-50'}`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white transition-all duration-500 ${
                        level.current 
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 scale-110 shadow-lg' 
                          : 'bg-gray-300'
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`font-bold ${level.current ? 'text-indigo-600' : 'text-gray-600'}`}>
                            {level.level}
                          </h4>
                          <span className="text-sm text-gray-500">{level.gigs} gigs</span>
                        </div>
                        {level.current && (
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: '60%' }}></div>
                          </div>
                        )}
                      </div>
                      {level.current && <Target className="text-indigo-600 animate-pulse" size={24} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'earnings' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">Earnings & Payments</h1>

              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  { label: 'Total Earnings', val: '₹25,400', sub: '+18% from last month', icon: DollarSign, color: 'from-green-500 to-green-600' },
                  { label: 'Pending', val: '₹3,200', sub: '2 gigs in escrow', icon: Clock, color: 'from-blue-500 to-blue-600' },
                  { label: 'This Month', val: '₹4,200', sub: '3 completed gigs', icon: TrendingUp, color: 'from-indigo-500 to-purple-600' }
                ].map((item, idx) => (
                  <div key={idx} className="group bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-transparent hover:border-indigo-500">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center text-white transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                        <item.icon size={24} />
                      </div>
                      <h3 className="font-semibold text-gray-600">{item.label}</h3>
                    </div>
                    <p className="text-4xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{item.val}</p>
                    <p className={`text-sm mt-2 ${item.label === 'Total Earnings' ? 'text-green-600' : 'text-gray-500'}`}>{item.sub}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Payment History</h3>
                  <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 hover:border-indigo-600 hover:text-indigo-600 flex items-center gap-2 transition-all active:scale-95 shadow-sm">
                    <Download size={18} />
                    Export
                  </button>
                </div>

                <div className="space-y-4">
                  {completedGigs.map((gig) => (
                    <div key={gig.id} className="group flex items-center justify-between p-4 border rounded-lg hover:border-green-200 hover:bg-green-50/30 transition-all duration-200">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center transition-transform group-hover:rotate-12">
                          <CheckCircle className="text-green-600" size={24} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">{gig.title}</p>
                          <p className="text-sm text-gray-500">{new Date(gig.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 group-hover:scale-110 transition-transform">{gig.earned}</p>
                        <p className="text-xs text-green-600 font-medium">Paid</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'scheduled' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">Upcoming Schedule</h1>
              <div className="bg-white rounded-xl shadow-lg p-12 text-center group hover:shadow-2xl transition-all duration-500 border-2 border-dashed border-gray-200 hover:border-indigo-300">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-125 group-hover:rotate-12">
                  <Calendar className="text-indigo-600" size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">No gigs scheduled for today</h3>
                <p className="text-gray-500 mt-2">Browse the marketplace to find and apply for upcoming opportunities.</p>
                <button 
                  onClick={() => setActiveTab('browse')}
                  className="mt-6 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:brightness-110 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95"
                >
                  Explore Gigs
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default WorkerDashboard;