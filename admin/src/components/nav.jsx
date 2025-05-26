import React from 'react';

const Nav = ({ onLogout }) => {
  const handleLogout = () => {
    localStorage.removeItem('token'); 
    onLogout(false); 
  };

  return (
    <nav className="bg-black text-white p-4 flex items-center justify-between">
      <div className="flex items-center">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSq5Kkn3gKB4zi_VhPmD11macRlNJAXxjNTbA&s"
          alt="Logo"
          className="h-15 w-15 mr-2"
        />
        <span className="text-xl font-bold">Admin Panel</span>
      </div>
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
      >
        Logout
      </button>
    </nav>
  );
};

export default Nav;