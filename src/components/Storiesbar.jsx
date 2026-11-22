import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { Plus, X } from 'lucide-react'
import Storymodel from './Storymodel'
import { API_URL, authHeaders, getCurrentUser } from '../lib/api'

const Storiesbar = () => {
  const [stories, setStories] = useState([])
  const [activeStory, setActiveStory] = useState(null)
  const [modelopen, setmodelopen] = useState(false)
  const scrollRef = useRef(null)
  const me = getCurrentUser()

  const fetchStories = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/stories/feed`, { headers: authHeaders() })
      const list = Array.isArray(data) ? data : []
      // Show only stories from people I follow (exclude my own from the list)
      const filtered = list.filter((s) => String(s?.author?._id || s?.author) !== String(me?.id))
      setStories(filtered)
    } catch (error) {
      console.error('Failed to fetch stories:', error)
      setStories([])
    }
  }

  useEffect(() => {
    fetchStories()
  }, [])

  useEffect(() => {
    let timer
    if (activeStory) {
      timer = setTimeout(() => setActiveStory(null), 5000)
    }
    return () => clearTimeout(timer)
  }, [activeStory])

  const renderStoryContent = (story) => {
    if (story.mediaType === 'text') {
      return (
        <div
          className="w-full h-full flex items-center justify-center p-8 rounded-xl"
          style={{ background: story.background || '#3357FF' }}
        >
          <p className="text-white text-2xl font-bold text-center whitespace-pre-wrap break-words">
            {story.content}
          </p>
        </div>
      )
    }
    if (story.mediaType === 'video') {
      return <video src={story.mediaUrl} controls autoPlay className="w-full h-full object-contain" />
    }
    return <img src={story.mediaUrl} className="w-full h-full object-contain" alt="" />
  }

  return (
    <div className="w-full top-4 z-20 bg-white pb-4 relative group border-b border-gray-100 animate-card-enter">
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto no-scrollbar px-8 scroll-smooth">
        {/* Add Story Button */}
        <div onClick={() => setmodelopen(true)} className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-slate-50">
            <Plus className="text-gray-500 w-6 h-6" />
          </div>
          <p className="text-[11px] font-medium text-gray-500 mt-1">Your Story</p>
        </div>

        {/* Stories List */}
        {stories.map((story) => {
          const author = story.author || {}
          return (
            <div key={story._id} onClick={() => setActiveStory(story)} className="flex flex-col items-center flex-shrink-0 cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600 p-[2px]">
                <div className="w-full h-full bg-white rounded-full p-[2px]">
                  <img
                    src={author.profilePic || 'https://ui-avatars.com/api/?name=User'}
                    className="w-full h-full rounded-full object-cover"
                    alt=""
                  />
                </div>
              </div>
              <p className="text-[11px] font-semibold text-gray-700 truncate w-16 text-center mt-1">
                {author.username || 'User'}
              </p>
            </div>
          )
        })}
      </div>

      {/* Story View Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md" onClick={() => setActiveStory(null)}>
          <div className="relative w-full max-w-[400px] h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setActiveStory(null)} className="absolute -top-10 right-0 text-white/80 hover:text-white">
              <X className="w-6 h-6" />
            </button>
            <div className="mb-3 flex items-center gap-2 text-white">
              <img
                src={activeStory.author?.profilePic || 'https://ui-avatars.com/api/?name=User'}
                className="w-8 h-8 rounded-full object-cover"
                alt=""
              />
              <span className="text-sm font-medium">{activeStory.author?.username || 'User'}</span>
            </div>
            <div className="w-full h-[calc(100%-44px)]">{renderStoryContent(activeStory)}</div>
          </div>
        </div>
      )}

      {/* Upload Story Modal */}
      {modelopen && <Storymodel setmodelopen={setmodelopen} fetchstorydata={fetchStories} />}
    </div>
  )
}

export default Storiesbar
