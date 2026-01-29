import React, { useState } from 'react';
import { 
  Briefcase, Plus, Users, Clock, DollarSign, CheckCircle, 
  XCircle, Star, MapPin, Calendar, Filter, Search, Edit,
  Trash2, Eye, UserCheck, Award, MessageSquare, TrendingUp,
  AlertCircle, Download, BarChart3, Settings, Bell, Menu, X
} from 'lucide-react';
import { useEffect } from "react";


const DEMO_JOBS = [
  {
    id: "demo-1",
    title: "College Fest Volunteer",
    location: "Pune",
    date: "2026-02-15",
    workers: 10,
    applied: 18,
    budget: "₹12,000",
    status: "Active",
    skills: ["Event Management", "Communication"]
  },
  {
    id: "demo-2",
    title: "Product Launch Helper",
    location: "Hinjewadi",
    date: "2026-02-20",
    workers: 6,
    applied: 9,
    budget: "₹9,000",
    status: "Active",
    skills: ["Marketing", "Customer Handling"]
  }
];

// --- Sub-Component: Create Job Modal ---
const CreateJobModal = ({ onClose, onCreate }) => {
    const [form, setForm] = useState({
    title: "",
    location: "",
    date: "",
    workers: "",
    budget: "",
    description: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!form.title || !form.location || !form.date) return;

    onCreate({
      title: form.title,
      location: form.location,
      date: form.date,
      workers: form.workers,
      budget: `₹${form.budget}`,
      skills: ["Event Management"], 
    });

    onClose();
}; 
 return(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-900">Create New Job</h3>
            <button onClick={() => onClose()} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title *</label>
            <input type="text" name="title" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" placeholder="e.g., Wedding Event Staff" value={form.title}
  onChange={handleChange}/>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
              <input value={form.location} name="location"
  onChange={handleChange} type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Pune, Koregaon Park" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Event Date *</label>
              <input type="date"
  name="date"
  min={new Date().toISOString().split("T")[0]}
  value={form.date}
  onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Workers Needed *</label>
              <input type="number" value={form.workers} name="workers"
      onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="5" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Budget per Worker *</label>
              <input type="number" value={form.budget} name="budget"
      onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="1500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Required Skills</label>
            <div className="flex flex-wrap gap-2">
              {['Event Management', 'Hospitality', 'Marketing'].map((skill) => (
                <button key={skill} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium hover:bg-indigo-600 hover:text-white transition-colors duration-200">
                  {skill} +
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Job Description *</label>
            <textarea name="description"
  value={form.description}
  onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Describe responsibilities..."></textarea>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3 hover:bg-yellow-100 transition-colors">
              <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Escrow Payment Required</p>
                <p>Deposit total budget to escrow before publishing.</p>
              </div>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex gap-3 justify-end sticky bottom-0">
          <button onClick={() => onClose()} className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-white hover:border-gray-400 transition-all active:scale-95">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all active:scale-95">
            Publish Job
          </button>
        </div>
      </div>
    </div>
);
};
// --- Main Dashboard Component ---
const OrganizerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeJobs, setActiveJobs] = useState(() => {
  const savedJobs = JSON.parse(localStorage.getItem("activeJobs")) || [];

  return [
    ...DEMO_JOBS,
    ...savedJobs
  ];
});

  useEffect(() => {
  const realJobs = activeJobs.filter(
    job => !String(job.id).startsWith("demo-")
  );

  localStorage.setItem("activeJobs", JSON.stringify(realJobs));
}, [activeJobs]);

  const handleCreateJob = (newJob) => {
  setActiveJobs((prev) => [
    {
      ...newJob,
      id: Date.now(),
      applied: 0,
      status: "Active",
    },
    ...prev
  ]);
};


  // Mock Data
  const stats = [
    { label: 'Active Jobs', value: '12', icon: Briefcase, color: 'from-blue-500 to-blue-600', change: '+3' },
    { label: 'Total Applications', value: '48', icon: Users, color: 'from-purple-500 to-purple-600', change: '+12' },
    { label: 'Hired Workers', value: '24', icon: UserCheck, color: 'from-green-500 to-green-600', change: '+8' },
    { label: 'Escrow Balance', value: '₹45,000', icon: DollarSign, color: 'from-indigo-500 to-indigo-600', change: '-₹15k' }
  ];

  

  const applications = [
    { id: 1, jobTitle: 'Wedding Event Staff Required', applicant: 'Priya Sharma', rating: 4.8, completedGigs: 23, badges: ['Event Pro', 'Reliable'], appliedDate: '2025-01-20', status: 'Pending' },
    { id: 2, jobTitle: 'Wedding Event Staff Required', applicant: 'Rahul Verma', rating: 4.9, completedGigs: 45, badges: ['Event Expert', 'Top Rated'], appliedDate: '2025-01-20', status: 'Pending' }
  ];

  const hiredWorkers = [
    { id: 1, name: 'Amit Singh', role: 'Security Head', status: 'On-Site', rating: 4.9, earnings: '₹2,500' },
    { id: 2, name: 'Sana Shaikh', role: 'Hostess', status: 'Completed', rating: 4.7, earnings: '₹1,800' }
  ];

  const transactions = [
    { id: 'TXN1024', user: 'Priya Sharma', amount: '₹1,500', status: 'Paid', date: '2025-01-20' },
    { id: 'TXN1025', user: 'Escrow Deposit', amount: '₹12,000', status: 'Pending', date: '2025-01-21' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased text-gray-900">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Menu size={24} />
              </button>
              <div className="flex items-center gap-2 group cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:rotate-6 transition-transform">
                  <Briefcase className="text-white" size={20} />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">GigXpress</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              </button>
              <div className="flex items-center gap-3 pl-4 border-l cursor-pointer hover:bg-gray-50 p-1 rounded-xl transition-colors">
                <img src="https://i.pravatar.cc/150?img=12" alt="Profile" className="w-9 h-9 rounded-full ring-2 ring-indigo-100" />
                <div className="hidden sm:block">
                  <p className="text-sm font-bold">Organizer Name</p>
                  <p className="text-xs text-indigo-600 font-medium">Premium</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r transition-transform duration-300 ease-in-out shadow-sm`}>
          <div className="p-6 space-y-6 pt-4">
            <button 
              onClick={() => setShowCreateJobModal(true)}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Plus size={20} /> Create New Job
            </button>

            <nav className="space-y-1">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'jobs', label: 'My Jobs', icon: Briefcase },
                { id: 'applications', label: 'Applications', icon: Users },
                { id: 'hired', label: 'Hired Workers', icon: UserCheck },
                { id: 'payments', label: 'Payments', icon: DollarSign }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    activeTab === item.id 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-hidden">
          
          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard Overview</h1>
                <p className="text-gray-500 mt-1">Manage your events and workers efficiently</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform`}>
                        <stat.icon size={24} />
                      </div>
                      <span className="text-xs font-bold px-2 py-1 bg-green-50 text-green-600 rounded-lg">{stat.change}</span>
                    </div>
                    <p className="text-gray-500 font-medium text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Users className="text-indigo-600" size={20}/> Recent Applications
                  </h3>
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-indigo-50/30 hover:border-indigo-100 transition-all group">
                        <div className="flex items-center gap-4">
                          <img src={`https://i.pravatar.cc/150?img=${app.id + 10}`} alt={app.applicant} className="w-12 h-12 rounded-full ring-2 ring-gray-50 group-hover:ring-indigo-200 transition-all" />
                          <div>
                            <p className="font-bold text-gray-900">{app.applicant}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs">
                              <Star size={14} className="text-amber-400 fill-current" />
                              <span className="font-bold">{app.rating}</span>
                              <span className="text-gray-400">• {app.completedGigs} gigs</span>
                            </div>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-bold hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all text-sm active:scale-95 shadow-sm">
                          Review
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Calendar className="text-purple-600" size={20}/> Upcoming Events
                  </h3>
                  <div className="space-y-4">
                    {activeJobs.map((job) => (
                      <div key={job.id} className="p-4 border border-gray-100 rounded-xl hover:bg-purple-50/30 hover:border-purple-100 transition-all cursor-pointer">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-gray-900">{job.title}</h4>
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider">{job.status}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 font-medium">
                          <div className="flex items-center gap-2"><Calendar size={14} className="text-indigo-500" /><span>{new Date(job.date).toLocaleDateString()}</span></div>
                          <div className="flex items-center gap-2"><Users size={14} className="text-indigo-500" /><span>{job.applied} Applied</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. MY JOBS TAB */}
          {activeTab === 'jobs' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-400">
              <h1 className="text-3xl font-extrabold text-gray-900">My Jobs</h1>
              <div className="grid gap-6">
                {activeJobs.map((job) => (
                  <div key={job.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:border-indigo-100 transition-all duration-300">
                    <div className="flex flex-col lg:flex-row justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 hover:text-indigo-600 transition-colors cursor-pointer">{job.title}</h3>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {job.skills.map((s) => (
                                <span key={s} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold">{s}</span>
                              ))}
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">{job.status}</span>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-6 mt-6 text-sm text-gray-500 font-medium">
                          <div className="flex items-center gap-2"><MapPin size={18} className="text-indigo-500" /><span>{job.location}</span></div>
                          <div className="flex items-center gap-2"><Calendar size={18} className="text-indigo-500" /><span>{new Date(job.date).toLocaleDateString()}</span></div>
                          <div className="flex items-center gap-2"><Users size={18} className="text-indigo-500" /><span>{job.applied} Applications</span></div>
                        </div>
                      </div>
                      <div className="flex lg:flex-col gap-3">
                        <button className="flex-1 lg:flex-none px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"><Eye size={18} /> View</button>
                        <button className="flex-1 lg:flex-none px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all active:scale-95 flex items-center justify-center gap-2"><Edit size={18} /> Edit</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. APPLICATIONS TAB */}
          {activeTab === 'applications' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-400">
              <h1 className="text-3xl font-extrabold text-gray-900">Applications</h1>
              <div className="grid gap-4">
                {applications.map((app) => (
                  <div key={app.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex gap-4">
                        <img src={`https://i.pravatar.cc/150?u=${app.applicant}`} alt={app.applicant} className="w-16 h-16 rounded-full group-hover:scale-105 transition-transform" />
                        <div>
                          <h3 className="text-lg font-bold">{app.applicant}</h3>
                          <p className="text-sm text-gray-500">{app.jobTitle}</p>
                          <div className="flex gap-2 mt-2">
                            {app.badges.map(badge => (
                              <span key={badge} className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-[10px] font-bold border border-purple-100">{badge}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button className="px-5 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 hover:shadow-lg transition-all active:scale-95 text-sm">Hire Now</button>
                        <button className="px-5 py-2 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all text-sm">Message</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. HIRED WORKERS TAB */}
          {activeTab === 'hired' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-400">
              <h1 className="text-3xl font-extrabold text-gray-900">Hired Workers</h1>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="p-4 font-bold text-gray-600">Worker</th>
                      <th className="p-4 font-bold text-gray-600">Role</th>
                      <th className="p-4 font-bold text-gray-600">Status</th>
                      <th className="p-4 font-bold text-gray-600">Earnings</th>
                      <th className="p-4 font-bold text-gray-600 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hiredWorkers.map((worker) => (
                      <tr key={worker.id} className="border-b border-gray-50 hover:bg-indigo-50/30 transition-colors group">
                        <td className="p-4 flex items-center gap-3 font-semibold">{worker.name}</td>
                        <td className="p-4 text-sm text-gray-500">{worker.role}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${worker.status === 'On-Site' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>{worker.status}</span>
                        </td>
                        <td className="p-4 font-bold">{worker.earnings}</td>
                        <td className="p-4 text-right">
                          <button className="text-gray-400 hover:text-indigo-600 transition-colors p-2 hover:bg-white rounded-lg"><Settings size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. PAYMENTS TAB */}
          {activeTab === 'payments' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-400">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-gray-900">Payments</h1>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm"><Download size={18} /> Statement</button>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl text-white shadow-lg">
                   <p className="text-indigo-100 text-sm font-medium">Escrow Balance</p>
                   <p className="text-3xl font-bold mt-1">₹45,000</p>
                   <button className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-all backdrop-blur-md">Add Funds</button>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                   <p className="text-gray-500 text-sm font-medium">Total Paid</p>
                   <p className="text-3xl font-bold mt-1">₹1,24,000</p>
                   <p className="text-green-500 text-xs font-bold mt-2">+12% from last month</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                   <p className="text-gray-500 text-sm font-medium">Pending Approvals</p>
                   <p className="text-3xl font-bold mt-1">₹8,500</p>
                   <p className="text-amber-500 text-xs font-bold mt-2">3 workers waiting</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-50 font-bold">Recent Transactions</div>
                {transactions.map(txn => (
                  <div key={txn.id} className="flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${txn.status === 'Paid' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}><DollarSign size={20} /></div>
                      <div><p className="font-bold text-sm">{txn.user}</p><p className="text-xs text-gray-400">{txn.id} • {txn.date}</p></div>
                    </div>
                    <div className="text-right"><p className="font-bold">{txn.amount}</p><p className={`text-[10px] font-bold ${txn.status === 'Paid' ? 'text-green-600' : 'text-amber-600'}`}>{txn.status}</p></div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {showCreateJobModal && <CreateJobModal onClose={() => setShowCreateJobModal(false)} onCreate={handleCreateJob}/>}
    </div>
  );
};

export default OrganizerDashboard;