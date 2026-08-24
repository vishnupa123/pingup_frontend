import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Loading from '../components/Loading';
import UserProfileInfo from '../components/UserProfileInfo';
import EditProfilePop from '../components/EditProfilePop';
import { Grid, Image, Heart } from 'lucide-react';
import MyProfile from '../components/MyProfile';

const Profilee = () => {
  const { profileId } = useParams();
  const [users, setUsers] = useState(null);
  const [post, setPost] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [showEdit, setShowEdit] = useState(false);

  const fetchProfileData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      // Always fetch the logged-in user so we can show follow state
      const meReq = axios.get(`${import.meta.env.VITE_API_URL}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } });

      if (profileId) {
        const [meRes, userRes, postRes] = await Promise.all([
          meReq,
          axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile/${profileId}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/posts/user/${profileId}`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setCurrentUser(meRes.data.user);
        setUsers(userRes.data.user);
        setPost(postRes.data);
      } else {
        const meRes = await meReq;
        setCurrentUser(meRes.data.user);
        setUsers(meRes.data.user);
        setPost(meRes.data.posts);
      }
    } catch (err) {
      console.error("Error fetching profile data:", err.response ? err.response.data : err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [profileId]);

  const textOnlyPosts = Array.isArray(post) ? post.filter(item => !item.image || item.image.trim() === "") : [];
  const mediaPosts = Array.isArray(post) ? post.filter(item => item.image && item.image.trim() !== "") : [];
  const likedPosts = Array.isArray(post) ? post.filter(item => item.likedByMe === true) : [];

  if (loading) return <div className='flex justify-center items-center min-h-[50vh]'><Loading /></div>;

  return (
    <div className='min-h-screen bg-slate-50/50 pb-12'>
      {users ? (
        <div className='flex flex-col'>

          {/* Profile Header Card */}
          <div className='bg-white shadow-sm overflow-hidden'>

            {/* Cover Photo */}
            <div className='relative'>
              {users.cover_photo && (
                <div className='h-48 sm:h-64 w-full bg-pink-100'>
                  <img src={users.cover_photo} alt="Cover" className='w-full h-full object-cover' />
                </div>
              )}
            </div>

            {/* Avatar — only pulls up if cover photo exists */}
            <div className={`relative pl-6 sm:pl-8 z-10 ${users.cover_photo ? '-mt-16 sm:-mt-20' : 'mt-4'}`}>
              <div className='w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden bg-white shadow-md shrink-0'>
                {users.profilePic ? (
                  <img src={users.profilePic} alt={users.fullName} className='w-full h-full object-cover rounded-full' />
                  
                ) : (
                  <div className='w-full h-full bg-pink-100 flex items-center justify-center text-2xl font-bold text-pink-400'>
                    {users.fullName?.charAt(0).toUpperCase()}

                  
                  </div>
                  
                )}


             
              </div>
            </div>

            {/* Profile Info */}
            <div className='px-6 sm:px-8 pb-6'>
              <UserProfileInfo
                user={users}
                posts={post}
                profileId={profileId}
                currentUser={currentUser}
                setShowEdit={setShowEdit}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </div>
          </div>

          {/* Edit Modal */}
          {showEdit && <EditProfilePop onClose={() => setShowEdit(false)} />}

          {/* Posts Tab Section */}
          <div className='bg-white shadow-sm border border-gray-100 overflow-hidden mt-3'>

            {/* Tab Navigation */}
            <div className='flex items-center justify-start gap-8 px-2 sm:px-6 border-b border-gray-50'>
              {[
                { id: 'posts', icon: <Grid size={18} /> },
                { id: 'media', icon: <Image size={18} /> },
                { id: 'likes', icon: <Heart size={18} /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-10 cursor-pointer py-4 text-sm font-semibold tracking-wide border-b-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-pink-500 text-pink-500'
                      : 'border-transparent text-gray-500 hover:text-gray-600'
                  }`}
                >
                  {tab.icon}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === 'posts' && <MyProfile posts={textOnlyPosts} />}
              {activeTab === 'media' && <MyProfile posts={mediaPosts} />}
              {activeTab === 'likes' && <MyProfile posts={likedPosts} />}
            </div>
          </div>

        </div>
      ) : (
        <div className='flex justify-center items-center min-h-[50vh]'>
          <p>User not found.</p>
        </div>
      )}
    </div>
  );
};

export default Profilee;