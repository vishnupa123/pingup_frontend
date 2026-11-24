import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserCard from '../components/UserCard';
import ReelsViewer from '../components/ReelsViewer';
import axios from 'axios';
import { API_URL } from '../lib/api';
import { fetchVideoPosts } from '../lib/videoFeed';

const getDisplayName = (post) =>
  post?.author?.fullName || post?.author?.username || 'PingUp user';

const getAuthorId = (post) =>
  typeof post?.author === 'object' ? post?.author?._id : post?.author;

const Discover = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideoIndex, setActiveVideoIndex] = useState(null);

  const fetchInitialData = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      const [usersRes, meRes] = await Promise.all([
        axios.get(`${API_URL}/api/users/`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setUsers(usersRes.data);
      setCurrentUser(meRes.data.user);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async () => {
    setVideosLoading(true);
    try {
      setVideos(await fetchVideoPosts());
    } catch (err) {
      console.error('Error fetching videos:', err);
      setVideos([]);
    } finally {
      setVideosLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query) {
      fetchInitialData();
      return;
    }

    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/users/search?query=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
    fetchVideos();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const updateVideo = (videoId, updater) => {
    setVideos((previous) =>
      previous.map((video) => (video._id === videoId ? updater(video) : video))
    );
  };

  return (
    <div className='max-w-6xl w-full p-6'>
      <h1 className='text-2xl font-semibold text-blue-600 mb-6'>Discover</h1>

      <div className='relative mb-6 max-w-md'>
        <Search className='absolute left-3 top-2 text-gray-400' size={16} />
        <input
          type='text'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder='Search by name or username...'
          className='w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400'
        />
      </div>

      {/* Videos */}
      <section className='mb-8'>
        {videosLoading ? (
          <p className='text-gray-500'>Loading videos...</p>
        ) : videos.length > 0 ? (
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'>
            {videos.map((video, index) => (
              <div
                key={video._id}
                className='group relative aspect-[9/8] overflow-hidden rounded-xl border border-gray-200 bg-black shadow-sm hover:shadow-lg transition-shadow'
              >
                <button
                  type='button'
                  onClick={() => setActiveVideoIndex(index)}
                  className='absolute inset-0 z-0 cursor-pointer'
                  aria-label={`Play video by ${getDisplayName(video)}`}
                >
                  <video
                    src={`${video.videoUrl}#t=0.1`}
                    muted
                    preload='metadata'
                    playsInline
                    className='pointer-events-none h-full w-full object-cover'
                  />
                </button>

                <div className='pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent' />

                <button
                  type='button'
                  onClick={() => {
                    const authorId = getAuthorId(video);
                    if (!authorId) return;
                    if (currentUser && String(authorId) === String(currentUser._id)) navigate('/profile');
                    else navigate(`/profile/${authorId}`);
                  }}
                  className='absolute bottom-2 left-2 z-20 cursor-pointer'
                  aria-label={`Open ${getDisplayName(video)} profile`}
                >
                  <img
                    src={video.author?.profilePic || 'https://ui-avatars.com/api/?name=User'}
                    alt={getDisplayName(video)}
                    className='h-7 w-7 rounded-full border-2 border-white object-cover shadow-md'
                    onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=User'; }}
                  />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className='rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm'>
            <p className='text-gray-400'>No videos to show yet.</p>
          </div>
        )}
      </section>

      {/* People */}
      <section>
        <h2 className='text-lg font-semibold text-gray-800 mb-3'>People</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {loading ? (
            <p className='text-gray-500'>Loading...</p>
          ) : (
            users
              .filter((u) => u._id !== currentUser?._id)
              .map((user) => (
                <UserCard user={user} key={user._id} currentUser={currentUser} />
              ))
          )}
        </div>
      </section>

      {/* Instagram-style reels player */}
      {activeVideoIndex !== null && videos[activeVideoIndex] && (
        <ReelsViewer
          videos={videos}
          initialIndex={activeVideoIndex}
          onClose={() => setActiveVideoIndex(null)}
          onUpdateVideo={updateVideo}
        />
      )}
    </div>
  );
};

export default Discover;
