import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, X } from 'lucide-react';
import { API_URL, authHeaders, getCurrentUser } from '../lib/api';
import StoryCreatorModal from './StoryCreatorModal';

const StoriesRow = () => {
  const [stories, setStories] = useState([]);
  const [myStories, setMyStories] = useState([]);
  const [openCreator, setOpenCreator] = useState(false);
  const [active, setActive] = useState(null);
  const me = getCurrentUser();

  const fetchStories = async () => {
    try {
      const [feedRes, myRes] = await Promise.all([
        axios.get(`${API_URL}/api/stories/feed`, { headers: authHeaders() }),
        axios.get(`${API_URL}/api/stories/me`, { headers: authHeaders() }),
      ]);
      setStories(Array.isArray(feedRes.data) ? feedRes.data : []);
      setMyStories(Array.isArray(myRes.data) ? myRes.data : []);
    } catch {
      setStories([]);
      setMyStories([]);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setActive(null), 5000);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">Stories</h3>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => (myStories.length > 0 ? setActive(myStories[0]) : setOpenCreator(true))}
          className="flex flex-col items-center gap-2 shrink-0 cursor-pointer"
        >
          <div className={`w-14 h-14 rounded-full border-2 ${myStories.length > 0 ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-dashed border-indigo-300 bg-indigo-50 text-indigo-600'} flex items-center justify-center hover:opacity-90 transition`}>
            <Plus size={22} />
          </div>
          <span className="text-[11px] text-gray-600 font-medium">{myStories.length > 0 ? 'Your Story' : 'Add Story'}</span>
        </button>

        {stories.map((story) => {
          const author = story.author || {};
          return (
            <button key={story._id} onClick={() => setActive(story)} className="flex flex-col items-center gap-2 shrink-0 cursor-pointer">
              <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 to-indigo-500">
                <div className="w-full h-full rounded-full bg-white p-[2px]">
                  <img
                    src={author.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.fullName || 'User')}`}
                    alt={author.username || 'User'}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
              <span className="text-[11px] text-gray-600 w-14 truncate">{author.username || 'User'}</span>
            </button>
          );
        })}
      </div>

      {openCreator && <StoryCreatorModal onClose={() => setOpenCreator(false)} onCreated={fetchStories} />}

      {active && (
        <div className="fixed inset-0 z-[120] bg-black/85 flex items-center justify-center p-4" onClick={() => setActive(null)}>
          <div className="relative w-full max-w-sm h-[75vh] rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
              {String(active.author?._id || active.author) === String(me?.id) && (
                <button
                  onClick={() => { setActive(null); setOpenCreator(true); }}
                  className="px-2.5 py-1 rounded-md bg-white/20 text-white text-xs hover:bg-white/30 cursor-pointer"
                >
                  Add
                </button>
              )}
              <button onClick={() => setActive(null)} className="text-white/80 hover:text-white cursor-pointer">
                <X size={22} />
              </button>
            </div>
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2 text-white">
              <img
                src={active.author?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(active.author?.fullName || 'User')}`}
                alt=""
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm font-medium">{active.author?.username || 'User'}</span>
            </div>
            <div className="w-full h-full flex items-center justify-center">
              {active.mediaType === 'text' ? (
                <div className="w-full h-full flex items-center justify-center p-8" style={{ background: active.background || '#4F46E5' }}>
                  <p className="text-white text-lg italic text-center whitespace-pre-wrap break-words">{active.content}</p>
                </div>
              ) : active.mediaType === 'video' ? (
                <video src={active.mediaUrl} controls autoPlay className="w-full h-full object-contain" />
              ) : (
                <img src={active.mediaUrl} alt="" className="w-full h-full object-contain" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoriesRow;
