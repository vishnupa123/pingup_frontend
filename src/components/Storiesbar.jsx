import React, { useEffect, useState, useRef } from 'react'
import { dummyStoriesData } from '../assets/assets'
import { Plus, X } from 'lucide-react'
import Storymodel from './Storymodel'

const Storiesbar = () => {
  const [stories, setstories] = useState([])
  const [activeStory, setActiveStory] = useState(null)
  const [modelopen, setmodelopen] = useState(false)
  const scrollRef = useRef(null)

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const fetchstorydata = () => {
    setstories(dummyStoriesData)
  };

  const formatTime = (dateString) => {
    if (!dateString) return '1h';
    const now = new Date();
    const past = new Date(dateString);
    const diffInHours = Math.floor((now - past) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  useEffect(() => {
    fetchstorydata()
  }, [])

  useEffect(() => {
    let timer;
    if (activeStory) {
      timer = setTimeout(() => {
        setActiveStory(null);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [activeStory]);

  return (
    <div className='w-full  top-4 z-20 bg-white pb-4 relative group border-b border-gray-100 animate-card-enter'>
      {/* Scrolling is native (overflow-x-auto) — left/right buttons removed to keep UI clean. */}

      <div ref={scrollRef} className='flex gap-4 overflow-x-auto no-scrollbar px-8 scroll-smooth'>
        {/* Add Story Button */}
        <div onClick={() => setmodelopen(true)} className='flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer'>
          <div className='w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-slate-50'>
            <Plus className='text-gray-500 w-6 h-6' />
          </div>
          <p className='text-[11px] font-medium text-gray-500 mt-1'>Your Story</p>
        </div>

        {/* Stories List */}
        {stories.map((story, index) => (
          <div key={index} onClick={() => setActiveStory(story)} className="flex flex-col items-center flex-shrink-0 cursor-pointer">
            <div className='w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600 p-[2px]'>
              <div className='w-full h-full bg-white rounded-full p-[2px]'>
                <img src={story.user.profile_picture} className='w-full h-full rounded-full object-cover' alt="" />
              </div>
            </div>
            <p className='text-[11px] font-semibold text-gray-700 truncate w-16 text-center mt-1'>{story.user.username}</p>
          </div>
        ))}
      </div>

      {/* Story View Modal */}
      {activeStory && (
        <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md' onClick={() => setActiveStory(null)}>
          <div className='relative w-full max-w-[400px] h-[80vh]' onClick={(e) => e.stopPropagation()}>
             <img src={activeStory.media_url} className='w-full h-full object-contain' alt="" />
          </div>
        </div>
      )}

      {/* Upload Story Modal */}
      {modelopen && (
        <Storymodel setmodelopen={setmodelopen} fetchstorydata={fetchstorydata} />
      )}
    </div>
  )
}

export default Storiesbar