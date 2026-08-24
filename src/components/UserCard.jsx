import { UserPlus, UserCheck } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { FaUserAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Avatar = ({ src, alt }) => {
  const [failed, setFailed] = useState(false);
  if (failed || !src) return (
    <div className='w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center shrink-0 border-2 border-pink-500/10'>
      <FaUserAlt className='text-pink-400 w-5 h-5' />
    </div>
  );
  return <img src={src} alt={alt} className='w-14 h-14 rounded-full object-cover border-2 border-pink-500/10 shrink-0' onError={() => setFailed(true)} />;
};

const UserCard = ({ user, currentUser }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(user.followers?.length || 0);
  const navigate = useNavigate();

  useEffect(() => {
    // Current user-ന്റെ following ലിസ്റ്റിൽ ഈ user ഉണ്ടോ എന്ന് പരിശോധിക്കുന്നു
    if (currentUser?.following) {
      setIsFollowing(
        currentUser.following.some(
          (f) => String(typeof f === 'object' ? f._id : f) === String(user._id)
        )
      );
    }
  }, [currentUser, user._id]);

  const handleFollow = async (e) => {
    e.stopPropagation(); // കാർഡ് ക്ലിക്ക് ആകുന്നത് തടയുന്നു
    const token = localStorage.getItem('token');
    const previousState = isFollowing;

    // Optimistic UI update
    setIsFollowing(!previousState);
    setFollowersCount((prev) => previousState ? prev - 1 : prev + 1);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/follow/${user._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      // എറർ വന്നാൽ പഴയ അവസ്ഥയിലേക്ക് മാറ്റുന്നു
      setIsFollowing(previousState);
      setFollowersCount((prev) => previousState ? prev + 1 : prev - 1);
      console.error('Follow action failed:', error);
    }
  };

  return (
    <div
      onClick={() => navigate(`/profile/${user._id}`)}
      className='cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border border-gray-100 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200'
    >
      <div className='flex items-start gap-4 flex-1 min-w-0'>
        <Avatar src={user.profilePic} alt={user.fullName} />
        <div className='flex-1 min-w-0'>
          <h3 className='font-semibold text-gray-800 truncate'>{user.fullName}</h3>
          <p className='text-xs text-gray-500 mb-1.5'>@{user.username}</p>
          <div className='flex items-center gap-3 text-xs text-gray-400'>
            <span><span className='font-semibold text-gray-600'>{followersCount}</span> followers</span>
            <span><span className='font-semibold text-gray-600'>{user.following?.length || 0}</span> following</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleFollow}
        className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${
          isFollowing ? 'bg-gray-100 text-gray-600' : 'bg-blue-600 text-white'
        }`}
      >
        {isFollowing ? (
          <span className='flex items-center gap-2'><UserCheck size={14} /> Following</span>
        ) : (
          <span className='flex items-center gap-2'><UserPlus size={14} /> Follow</span>
        )}
      </button>
    </div>
  );
};

export default UserCard;