import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, X } from 'lucide-react';
import { API_URL, authHeaders, getCurrentUser } from '../lib/api';
import StoryCreatorModal from './StoryCreatorModal';

const SEEN_KEY = 'seenStoryIds';

const StoriesRow = () => {
  const [stories, setStories] = useState([]);
  const [myStories, setMyStories] = useState([]);
  const [openCreator, setOpenCreator] = useState(false);
  const [viewer, setViewer] = useState({ items: [], index: 0 });
  const [seenIds, setSeenIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '[]'); } catch { return []; }
  });
  const me = getCurrentUser();

  const active = viewer.items[viewer.index] || null;

  const markSeen = (id) => {
    if (!id) return;
    setSeenIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem(SEEN_KEY, JSON.stringify(next));
      return next;
    });
  };

  const closeViewer = () => setViewer({ items: [], index: 0 });
  const openViewer = (items, startIndex = 0) => setViewer({ items, index: startIndex });
  const goNext = () => {
    setViewer((v) => {
      if (!v.items.length) return v;
      if (v.index < v.items.length - 1) return { ...v, index: v.index + 1 };
      return { items: [], index: 0 };
    });
  };
  const goPrev = () => {
    setViewer((v) => (v.index > 0 ? { ...v, index: v.index - 1 } : v));
  };

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
    if (!active?._id) return;
    markSeen(active._id);
    if (active.mediaType === 'video') return undefined;
    const t = setTimeout(() => {
      setViewer((v) => {
        if (!v.items.length) return v;
        if (v.index < v.items.length - 1) return { ...v, index: v.index + 1 };
        return { items: [], index: 0 };
      });
    }, 5000);
    return () => clearTimeout(t);
  }, [active?._id, active?.mediaType, viewer.index]);

  return (
    <div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-0.5">
        <button
          onClick={() => (myStories.length > 0 ? openViewer(myStories, 0) : setOpenCreator(true))}
          className="flex flex-col items-center gap-2 shrink-0 cursor-pointer"
        >
          <div className={`w-14 h-14 rounded-full border-2 ${myStories.length > 0 ? (seenIds.includes(myStories[0]._id) ? 'border-gray-300 bg-gray-50 text-gray-500' : 'border-pink-500 bg-pink-50 text-pink-600') : 'border-dashed border-indigo-300 bg-indigo-50 text-indigo-600'} flex items-center justify-center hover:opacity-90 transition`}>
            <Plus size={22} />
          </div>
          <span className="text-[11px] text-gray-600 font-medium">{myStories.length > 0 ? 'Your Story' : 'Add Story'}</span>
        </button>

        {stories.map((story, idx) => {
          const author = story.author || {};
          return (
            <button key={story._id} onClick={() => { markSeen(story._id); openViewer(stories, idx); }} className="flex flex-col items-center gap-2 shrink-0 cursor-pointer">
              <div className={`w-14 h-14 rounded-full p-[2px] ${seenIds.includes(story._id) ? 'bg-gray-300' : 'bg-gradient-to-tr from-pink-500 to-indigo-500'}`}>
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
        <div className="fixed inset-0 z-[120] bg-black/85 flex items-center justify-center p-4" onClick={closeViewer}>
          <div className="relative w-full max-w-sm h-[75vh] rounded-2xl overflow-hidden bg-black" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-2 left-2 right-2 z-20 flex gap-1">
              {viewer.items.map((item, i) => (
                <div key={item._id || i} className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden">
                  <div className={`h-full bg-white ${i < viewer.index ? 'w-full' : i === viewer.index ? 'w-full' : 'w-0'}`} />
                </div>
              ))}
            </div>

            <div className="absolute top-5 right-3 z-20 flex items-center gap-2">
              {String(active.author?._id || active.author) === String(me?.id) && (
                <button
                  onClick={() => { closeViewer(); setOpenCreator(true); }}
                  className="px-2.5 py-1 rounded-md bg-white/20 text-white text-xs hover:bg-white/30 cursor-pointer"
                >
                  Add
                </button>
              )}
              <button onClick={closeViewer} className="text-white/80 hover:text-white cursor-pointer">
                <X size={22} />
              </button>
            </div>

            <div className="absolute top-5 left-3 z-20 flex items-center gap-2 text-white">
              <img
                src={active.author?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(active.author?.fullName || 'User')}`}
                alt=""
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm font-medium">{active.author?.username || 'User'}</span>
            </div>

            <button type="button" aria-label="Previous story" onClick={goPrev} className="absolute left-0 top-0 bottom-0 w-1/3 z-10 cursor-pointer" />
            <button type="button" aria-label="Next story" onClick={goNext} className="absolute right-0 top-0 bottom-0 w-1/3 z-10 cursor-pointer" />

            <div className="w-full h-full flex items-center justify-center">
              {active.mediaType === 'text' ? (
                <div className="w-full h-full flex items-center justify-center p-8" style={{ background: active.background || '#4F46E5' }}>
                  <p className="text-white text-lg italic text-center whitespace-pre-wrap break-words">{active.content}</p>
                </div>
              ) : active.mediaType === 'video' ? (
                <video src={active.mediaUrl} controls autoPlay onEnded={goNext} className="w-full h-full object-contain" />
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
