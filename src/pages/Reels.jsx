import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReelsViewer from '../components/ReelsViewer'
import { fetchVideoPosts, shuffleItems } from '../lib/videoFeed'

const Reels = () => {
  const navigate = useNavigate()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const loadReels = async () => {
      try {
        const posts = await fetchVideoPosts()
        if (!cancelled) setVideos(shuffleItems(posts))
      } catch (error) {
        console.error('Error loading reels:', error)
        if (!cancelled) setVideos([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadReels()
    return () => { cancelled = true }
  }, [])

  const updateVideo = (videoId, updater) => {
    setVideos((previous) =>
      previous.map((video) => (video._id === videoId ? updater(video) : video))
    )
  }

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-slate-50 text-sm text-gray-400'>
        Loading reels...
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 text-center'>
        <p className='text-sm text-gray-400'>No reels yet. Add a video post to get started.</p>
        <button
          type='button'
          onClick={() => navigate('/create-post')}
          className='rounded-lg bg-pink-500 px-4 py-2 text-sm font-semibold text-white cursor-pointer'
        >
          Create a post
        </button>
      </div>
    )
  }

  return (
    <ReelsViewer
      videos={videos}
      initialIndex={0}
      onClose={() => navigate('/discover')}
      onUpdateVideo={updateVideo}
    />
  )
}

export default Reels
