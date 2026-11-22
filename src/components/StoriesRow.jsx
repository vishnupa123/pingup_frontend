import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, X } from 'lucide-react';
import { API_URL, authHeaders } from '../lib/api';
import StoryCreatorModal from './StoryCreatorModal';

const StoriesRow = () => {
  const [stories, setStories] = useState([]);
  const [openCreator, setOpenCreator] = useState(false);
  const [active, setActive] = useState(null);

  const fetchStories = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/stories/feed`, { headers: authHeaders() });
      setStories(Array.isArray(data) ? data : []);
    } catch {
      setStories([]);
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
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">Stories</h3>
        <span className="text-xs text-gray-400">Visible to followers</span>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setOpenCreator(true)}
          className="flex flex-col items-center gap-2 shrink-0"
        >
          <div className="w-14 h-14 rounded-full border-2 border-dashed border-indigo-300 bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition">
            <Plus size={22} />
          </div>
          <span className="text-[11px] text-gray-600 font-medium">Add Story</span>
        </button>

        {stories.map((story) => {
          const author = story.author || {};
          return (
            <button key={story._id} onClick={() => setActive(story)} className="flex flex-col items-center gap-2 shrink-0">
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
          <div className="relative w-full max-w-md h-[75vh] bg-black rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setActive(null)} className="absolute top-3 right-3 z-10 text-white/80 hover:text-white">
              <X size={22} />
            </button>
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
                  <p className="text-white text-2xl font-bold text-center whitespace-pre-wrap break-words">{active.content}</p>
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
