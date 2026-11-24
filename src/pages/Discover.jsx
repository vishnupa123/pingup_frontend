import React, { useEffect, useRef, useState } from 'react';
import { Play, Search, X } from 'lucide-react';
import UserCard from '../components/UserCard';
import axios from 'axios';
import { API_URL } from '../lib/api';

const getVideoUrl = (post) =>
  [
    post?.video,
    post?.mediaType === 'video' ? post?.media_url : null,
    post?.media_type === 'video' ? post?.media_url : null,
  ].find(Boolean) || null;

const getDisplayName = (post) =>
  post?.author?.fullName || post?.author?.username || 'PingUp user';

const Discover = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideo, setActiveVideo] = useState(null);
  const videoRef = useRef(null);

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
    const token = localStorage.getItem('token');
    setVideosLoading(true);
    try {
      const allPosts = [];
      let page = 1;

      // Feed is paginated, so keep fetching until every video post is loaded.
      while (page <= 50) {
        const res = await axios.get(`${API_URL}/api/posts?page=${page}&limit=20`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const posts = Array.isArray(res.data?.posts)
          ? res.data.posts
          : Array.isArray(res.data)
            ? res.data
            : [];

        allPosts.push(...posts);
        if (!res.data?.hasMore) break;
        page += 1;
      }

      const videoPosts = allPosts
        .map((post) => {
          const videoUrl = getVideoUrl(post);
          return videoUrl ? { ...post, videoUrl } : null;
        })
        .filter(Boolean);

      setVideos(videoPosts);
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

  useEffect(() => {
    if (!activeVideo) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const playTimer = window.setTimeout(() => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = 0;
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') promise.catch(() => {});
    }, 0);

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setActiveVideo(null);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(playTimer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeVideo]);

  return (
    <div className='max-w-6xl w-full p-6'>
      <h1 className='text-2xl font-semibold text-blue-600 mb-6'>Discover</h1>

      <div className='relative mb-8'>
        <Search className='absolute left-3 top-3 text-gray-400' size={18} />
        <input
          type='text'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder='Search by name or username...'
          className='w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400'
        />
      </div>

      {/* Videos */}
      <section className='mb-8'>
        <div className='flex items-center gap-2 mb-3'>
          <h2 className='text-lg font-semibold text-gray-800'>Videos</h2>
          <span className='text-xs text-gray-400'>
            {videosLoading ? 'Loading...' : `${videos.length} videos`}
          </span>
        </div>

        {videosLoading ? (
          <p className='text-gray-500'>Loading videos...</p>
        ) : videos.length > 0 ? (
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'>
            {videos.map((video) => (
              <button
                type='button'
                key={video._id}
                onClick={() => setActiveVideo(video)}
                className='group relative aspect-[9/16] overflow-hidden rounded-xl border border-gray-200 bg-black shadow-sm hover:shadow-lg transition-shadow cursor-pointer'
                aria-label={`Play video by ${getDisplayName(video)}`}
              >
                <video
                  src={`${video.videoUrl}#t=0.1`}
                  muted
                  preload='metadata'
                  playsInline
                  className='pointer-events-none h-full w-full object-cover'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20' />
                <div className='absolute inset-0 flex items-center justify-center'>
                  <span className='flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-md transition-transform group-hover:scale-105'>
                    <Play size={18} fill='currentColor' className='ml-0.5' />
                  </span>
                </div>
                <div className='absolute bottom-2 left-2 right-2 text-left'>
                  <p className='truncate text-xs font-semibold text-white'>@{getDisplayName(video)}</p>
                  {video.content && (
                    <p className='truncate text-[10px] text-white/80'>{video.content}</p>
                  )}
                </div>
              </button>
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

      {/* Shorts-style player */}
      {activeVideo && (
        <div
          className='fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3'
          onClick={() => setActiveVideo(null)}
        >
          <button
            type='button'
            onClick={() => setActiveVideo(null)}
            className='absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer'
            aria-label='Close video'
          >
            <X size={22} />
          </button>

          <div
            className='relative h-[min(85vh,680px)] aspect-[9/16] max-w-[92vw] overflow-hidden rounded-2xl bg-black shadow-2xl'
            onClick={(e) => e.stopPropagation()}
          >
            <video
              ref={videoRef}
              src={activeVideo.videoUrl}
              controls
              autoPlay
              playsInline
              loop
              className='h-full w-full object-contain bg-black'
            />
            <div className='pointer-events-none absolute left-3 top-3 rounded-full bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-sm'>
              @{getDisplayName(activeVideo)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Discover;
