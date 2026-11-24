import React from 'react';
import { assets, dummyConnectionsData } from '../assets/assets';
import { useNavigate, NavLink } from 'react-router-dom';
import MenuItems from './MenuItems';
import { CirclePlus, LogOut, Sparkles } from 'lucide-react';
import { UserButton, useClerk } from '@clerk/clerk-react';

const SideBar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const { signOut } = useClerk();

  // Load custom logged in user or fallback to dummy user details
  const localUserStr = localStorage.getItem('user');
  const localUser = localUserStr ? JSON.parse(localUserStr) : null;

  const user = localUser ? {
    name: localUser.fullName,
    username: localUser.username,
    profile_picture: localUser.profilePic || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"
  } : dummyConnectionsData[0];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    signOut();
    window.location.href = '/login';
  };

  return (
    <div
      className={`fixed sm:static top-0 left-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-30 transition-transform duration-300 ease-in-out overflow-y-auto no-scrollbar pt-14 sm:pt-0
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}`}
    >
      {/* Sticky logo + navigation icons */}
      <div className="sticky top-14 sm:top-0 z-10 bg-white">
        <div className="p-6">
          <img
            onClick={() => { setSidebarOpen(false); navigate('/') }}
            src={assets.logo}
            alt="Logo"
            className="w-32 cursor-pointer transition-transform active:scale-95"
          />
        </div>

        <hr className="border-gray-100 mb-4 mx-6" />

        <div className="flex-none">
          <MenuItems setSidebarOpen={setSidebarOpen} />
        </div>
      </div>

      {/* Create Post / AI World / Logout — scrolls under the sticky icons */}
      <div className="px-6 mt-1 pb-4">
        <NavLink
          to="/ai-world"
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            `px-3.5 py-2.5 flex items-center gap-3 rounded-md font-medium transition-colors mb-2 ${
              isActive ? 'bg-blue-100 text-pink-600' : 'text-pink-500 hover:bg-blue-100'
            }`
          }
        >
          <Sparkles className="w-5 h-5" />
          <span>AI World</span>
        </NavLink>

        <NavLink
          to='/create-post'
          onClick={() => setSidebarOpen(false)}
          className="px-3.5 py-2.5 flex items-center gap-3 rounded-md text-white font-medium transition-all duration-300 bg-gradient-to-r from-blue-400 to-pink-600 hover:from-blue-200 hover:to-pink-600 shadow-md shadow-blue-100 active:scale-95"
        >
          <CirclePlus className="w-5 h-5 text-white" />
          <span>Create Post</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full mt-3 px-3.5 py-2.5 flex items-center gap-3 rounded-md font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>

      {/* User Profile Section - Pushed to the bottom */}
      <div className="mt-auto p-4 border-t border-gray-100 bg-slate-50/50">
        <div className="flex items-center gap-3 px-2">
          {localUser ? (
            <img
              src={localUser.profilePic || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"}
              alt={localUser.fullName}
              className="w-9 h-9 rounded-full object-cover border border-pink-200"
            />
          ) : (
            <div className="scale-110">
              <UserButton afterSignOutUrl="/"/>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-gray-800 truncate">
              {user?.name || "User Name"}
            </h1>
            <p className="text-xs text-pink-500 truncate font-medium">
              @{user?.username || "username"}
            </p>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              signOut();
              window.location.href = '/login';
            }}
            className="p-1.5 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 cursor-pointer text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
