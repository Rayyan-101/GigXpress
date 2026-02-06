import React, { useState } from 'react';
import { Briefcase, Monitor } from 'lucide-react';

const JoinPage = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  
  const roles = [
    {
      id: 'organizer',
      title: "I'm an organizer, hiring for events",
      icon: <Briefcase size={24} />,
    },
    {
      id: 'worker',
      title: "I'm a volunteer, looking for gigs",
      icon: <Monitor size={24} />,
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-[#001e00]">
      {/* Header / Logo */}
      <header className="p-6">
        <div className="max-w-7xl mx-auto">
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                GigXpress
              </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pt-12 flex flex-col items-center">
        <h2 className="text-3xl font-medium mb-10 text-center">
          Join as an organizer or volunteer
        </h2>

        {/* Card Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-10">
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 group flex flex-col h-48
                ${selectedRole === role.id 
                  ? 'border-[#108a00] bg-[#f2f7f2]' 
                  : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              {/* Radio Circle */}
              <div className="absolute top-4 right-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                  ${selectedRole === role.id 
                    ? 'border-[#108a00] bg-[#108a00]' 
                    : 'border-gray-300 group-hover:border-gray-400'
                  }`}
                >
                  {selectedRole === role.id && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
              </div>

              {/* Icon */}
              <div className="mb-4 text-gray-700">
                {role.icon}
              </div>

              {/* Text */}
              <h3 className="text-xl font-medium leading-tight pr-4">
                {role.title}
              </h3>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <button
          disabled={!selectedRole}
          className={`px-8 py-2 rounded-full font-medium transition-all mb-6 w-full md:w-auto min-w-[200px]
            ${selectedRole 
              ? 'bg-[#108a00] text-white hover:bg-[#14a800] active:scale-95' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
        >
          {selectedRole === 'organizer' ? 'Join as an Organizer' : selectedRole === 'worker' ? 'Join as a Volunteer' : 'Create Account'}
        </button>

        {/* Footer Link */}
        <p className="text-sm">
          Already have an account?{' '}
          <a href="#" className="text-[#108a00] underline hover:no-underline">Log In</a>
        </p>
      </main>
    </div>
  );
};

export default JoinPage;