import { CheckCircle, MapPin, Calendar, PenBox, UserCheck, UserPlus, MessageCircle, MoreHorizontal, LogOut, Trash2 } from 'lucide-react'
import moment from 'moment'
import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios';
import toast from 'react-hot-toast';

const UserProfileInfo = ({ user, posts = [], profileId, setShowEdit, currentUser }) => {
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(user.followers?.length || 0)
  const [isMutualFollow, setIsMutualFollow] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  const normalizeUserId = (value) => String(typeof value === 'object' ? value?._id || value?.id || '' : value || '')
  const hasUserId = (list = [], targetId) => list.some((item) => normalizeUserId(item) === String(targetId))

  useEffect(() => {
    setFollowersCount(user.followers?.length || 0)
  }, [user.followers])

  useEffect(() => {
    if (!currentUser) return
    const followingList = currentUser.following || []
    const found = followingList.some((f) => normalizeUserId(f) === String(user._id))
    setIsFollowing(found)
  }, [currentUser, user._id])

  useEffect(() => {
    if (!currentUser || !user?._id) {
      setIsMutualFollow(false)
      return
    }

    const userFollowsMe = hasUserId(user.followers || [], currentUser._id)
    setIsMutualFollow(isFollowing && userFollowsMe)
  }, [currentUser, user, isFollowing])

  // Connections = people who follow this profile and are also followed by me.
  const connectionsCount = currentUser
    ? (user.followers || []).filter((follower) => hasUserId(currentUser.following || [], follower)).length
    : 0

  const handleFollowToggle = async () => {
    const token = localStorage.getItem('token')
    const previous = isFollowing
    // optimistic UI
    setIsFollowing(!previous)
    setFollowersCount(prev => previous ? prev - 1 : prev + 1)
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/users/follow/${user._id}`, {}, { headers: { Authorization: `Bearer ${token}` } })
    } catch (err) {
      // revert on error
      setIsFollowing(previous)
      setFollowersCount(prev => previous ? prev + 1 : prev - 1)
      toast.error('Failed to update follow status')
      console.error('Follow toggle failed', err)
    }
  }


  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/delete`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        toast.success("Account deleted successfully");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        window.location.reload();
      } catch (error) {
        console.error("Error deleting account:", error);
        toast.error(error.response?.data?.message || "Failed to delete account");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setShowMenu(false);
    navigate('/login');
    window.location.reload();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className='w-full'>

      {/* Name and Verification Badge Row */}
      <div className='flex items-center gap-2 flex-wrap'>
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight'>
          {user.fullName}
        </h1>
        {user.is_verified && (
          <CheckCircle className='w-5 h-5 text-blue-500 shrink-0' />
        )}
        {!profileId && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowEdit(true)}
              className='p-1.5 hover:bg-slate-50 rounded-lg transition-colors group mt-0.5'
            >
              <PenBox className='cursor-pointer w-5 h-5 text-green-400 group-hover:text-pink-500 transition-colors shrink-0' />
            </button>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu((v) => !v)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors mt-0.5"
                aria-label="Profile menu"
              >
                <MoreHorizontal className="w-5 h-5 text-black" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-100 rounded-lg shadow-lg z-50 py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); handleDeleteAccount(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={16} /> Delete Account
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Follow / Following button when viewing someone else's profile */}
        {profileId && currentUser && currentUser._id !== user._id && (
          <div className='flex items-center gap-2 mt-[3px] flex-wrap'>
            <button
              onClick={handleFollowToggle}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition ${isFollowing ? 'bg-gray-100 text-gray-600' : 'bg-blue-600 text-white'}`}
              style={{ minWidth: 96 }}
            >
              {isFollowing ? (
                <span className='flex items-center gap-2'><UserCheck size={14} /> Following</span>
              ) : (
                <span className='flex items-center gap-2'><UserPlus size={14} /> Follow</span>
              )}
            </button>

            {isMutualFollow && (
              <button
                onClick={() => {
                  navigate(`/messages/${user._id}`)
                }}
                className='px-4 py-2 rounded-md text-sm font-semibold transition bg-pink-500 text-white hover:bg-pink-600'
              >
                <span className='flex items-center gap-2'><MessageCircle size={14} /> Message</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Username */}
      <div className='mt-0.5'>
        <p className='text-sm font-semibold text-pink-500'>@{user.username}</p>
      </div>

      {/* Bio */}
      <div className='mt-4 max-w-xl'>
        <p className='text-sm text-gray-600 leading-relaxed whitespace-pre-line'>
          {user.bio || "No bio added yet."}
        </p>
      </div>

      {/* Meta Info */}
      <div className='flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 pt-4 border-t border-gray-100 text-xs font-medium text-gray-500'>
        {user.location && (
          <div className='flex items-center gap-1'>
            <MapPin size={14} className='shrink-0' />
            <span>{user.location}</span>
          </div>
        )}
        <div className='flex items-center gap-1'>
          <Calendar size={14} className='shrink-0' />
          <span>Joined {moment(user.createdAt).fromNow()}</span>
        </div>
      </div>

      {/* Stats */}
      <div className='flex items-center flex-wrap gap-x-8 gap-y-3 mt-6 pt-4 border-t border-gray-100'>
        <div className='flex items-baseline gap-1.5'>
          <span className='text-lg font-bold text-pink-500'>{posts?.length || 0}</span>
          <span className='text-xs font-medium text-gray-500'>Posts</span>
        </div>

        <Link to='/connections' className='flex items-center gap-x-8 gap-y-3 flex-wrap hover:opacity-80 transition-opacity'>
          <div className='flex items-baseline gap-1.5'>
            <span className='text-lg font-bold text-pink-500'>{followersCount}</span>
            <span className='text-xs font-medium text-gray-500'>Followers</span>
          </div>
          <div className='flex items-baseline gap-1.5'>
            <span className='text-lg font-bold text-pink-500'>{user.following?.length || 0}</span>
            <span className='text-xs font-medium text-gray-500'>Following</span>
          </div>
          <div className='flex items-baseline gap-1.5'>
            <span className='text-lg font-bold text-pink-500'>{connectionsCount}</span>
            <span className='text-xs font-medium text-gray-500'>Connections</span>
          </div>
        </Link>
      </div>

    </div>
  )
}

export default UserProfileInfo;