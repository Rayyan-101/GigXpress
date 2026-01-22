import { useState } from 'react';

function DropdownMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigation = (role) => {
    if (role === 'admin') {
      window.location.href = '/admin';
    } else if (role === 'organizer') {
      window.location.href = '/organizer';
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition shadow-lg"
      >
        Get Started
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl overflow-hidden z-10">
          <button
            onClick={() => handleNavigation('admin')}
            className="w-full px-4 py-3 text-left text-gray-700 hover:bg-indigo-50 transition"
          >
            Admin
          </button>
          <button
            onClick={() => handleNavigation('organizer')}
            className="w-full px-4 py-3 text-left text-gray-700 hover:bg-indigo-50 transition"
          >
            Organizer
          </button>
        </div>
      )}
    </div>
  );
}

export default DropdownMenu;