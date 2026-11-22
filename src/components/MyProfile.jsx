import React, { useEffect, useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const timeAgo = (iso) => {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const getStoredUserId = () => {
  try {
    const stored = JSON.parse(localStorage.getItem('user') || '{}')
    return stored?._id || stored?.id || stored?.userId || null
  } catch {
    return null
  }
}

const getPersistedLikedPosts = () => {
  try {
    return JSON.parse(localStorage.getItem('likedPosts') || '{}')
  } catch {
    return {}
  }
}

// Matches the feed: API flag, likes array, and locally persisted likes.
const buildLikeState = (posts = []) => {
  const myId = getStoredUserId()
  const persisted = getPersistedLikedPosts()
  const state = {}

  posts.forEach((item) => {
    const id = item?._id
    if (!id) return

    const liked = Boolean(
      item?.likedByMe === true ||
      item?.isLiked === true ||
      (myId && Array.isArray(item?.likes) && item.likes.some((likeId) => String(likeId) === String(myId))) ||
      persisted[id] === true
    )
    const count = typeof item?.likeCount === 'number'
      ? item.likeCount
      : Array.isArray(item?.likes) ? item.likes.length : 0

    state[id] = { liked, count }
  })

  return state
}

const MyProfile = ({ posts = [] }) => {
  const [likeState, setLikeState] = useState(() => buildLikeState(posts))

  useEffect(() => {
    setLikeState(buildLikeState(posts))
  }, [posts])

  const toggleLike = async (item) => {
    const id = item?._id
    if (!id) return

    const current = likeState[id] || { liked: false, count: 0 }
    const nextLiked = !current.liked

    setLikeState((prev) => ({
      ...prev,
      [id]: {
        liked: nextLiked,
        count: Math.max(0, current.count + (nextLiked ? 1 : -1)),
      },
    }))

    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${API_URL}/api/posts/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const persisted = getPersistedLikedPosts()
      persisted[id] = nextLiked
      localStorage.setItem('likedPosts', JSON.stringify(persisted))
    } catch (error) {
      console.error('Error updating like:', error)
      setLikeState((prev) => ({ ...prev, [id]: current }))
    }
  }

  if (!Array.isArray(posts) || posts.length === 0) {
    return (
      <div className='w-full lg:w-[55%] ml-0 p-12 text-center text-sm text-gray-500 font-medium bg-white rounded-xl border border-gray-100 mt-4'>
        No posts to display yet.
      </div>
    )
  }

  return (
    <div className='w-full lg:w-[55%] ml-0 pl-2 sm:pl-6 flex flex-col divide-y divide-gray-100 bg-white'>
      {posts.map((item, index) => {
        const author = item?.author || item?.user || item?.postedBy || {}
        const avatar = author.profilePic || author.profile_picture || 'https://ui-avatars.com/api/?name=User'
        const name = author.fullName || author.full_name || author.username || 'Anonymous'
        const username = author.username || 'user'

        const images = [
          ...(Array.isArray(item?.images) ? item.images : []),
          item?.image,
          item?.mediaType === 'image' ? item?.media_url : null,
        ].filter(Boolean)
        const video = item?.video || (item?.mediaType === 'video' ? item?.media_url : null)

        const like = likeState[item?._id] || {
          liked: Boolean(item?.likedByMe || item?.isLiked),
          count: typeof item?.likeCount === 'number'
            ? item.likeCount
            : Array.isArray(item?.likes) ? item.likes.length : 0,
        }
        const commentsCount = Array.isArray(item?.comments)
          ? item.comments.length
          : typeof item?.comments === 'number' ? item.comments : 0

        return (
          <div key={item?._id || index} className='py-5 pr-4 hover:bg-slate-50/30 transition-colors duration-150'>

            {/* Header */}
            <div className='flex items-center gap-3 mb-3 mt-4'>
              <img
                src={avatar}
                alt={name}
                className='w-10 h-10 rounded-full object-cover bg-gray-100'
                onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=User' }}
              />
              <div className='flex flex-col'>
                <span className='text-sm font-semibold text-gray-900'>{name}</span>
                <span className='text-xs text-gray-500'>@{username}</span>
              </div>
              {item?.createdAt && (
                <span className='ml-auto text-xs text-gray-500'>{timeAgo(item.createdAt)}</span>
              )}
            </div>

            {/* Content */}
            {item?.content && (
              <p className='text-sm text-gray-800 mb-3 leading-relaxed whitespace-pre-line'>
                {item.content}
              </p>
            )}

            {/* Media */}
            {images.length > 0 && (
              <div className={`grid gap-2 mb-3 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {images.map((src, imageIndex) => (
                  <div key={imageIndex} className='w-full rounded-xl overflow-hidden max-h-80 border border-gray-100 bg-slate-50/50'>
                    <img src={src} alt='post media' className='w-full h-full max-h-80 object-cover' />
                  </div>
                ))}
              </div>
            )}
            {video && (
              <div className='w-full rounded-xl overflow-hidden max-h-80 mb-3 border border-gray-100 bg-black'>
                <video controls className='w-full max-h-80 object-contain'>
                  <source src={video} />
                </video>
              </div>
            )}

            {/* Actions — same like behaviour as the feed */}
            <div className='flex items-center gap-5 pt-1'>
              <button
                type='button'
                onClick={() => toggleLike(item)}
                className={`flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-colors ${
                  like.liked ? 'text-pink-500 hover:text-pink-600' : 'text-gray-500 hover:text-pink-500'
                }`}
              >
                <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4' fill={like.liked ? 'currentColor' : 'none'} viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z' />
                </svg>
                <span>{like.count}</span>
              </button>

              <div className='flex items-center gap-1.5 text-xs font-medium text-gray-500'>
                <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M8 12h.01M12 12h.01M16 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' />
                </svg>
                <span>{commentsCount}</span>
              </div>
            </div>

          </div>
        )
      })}
    </div>
  )
}

export default MyProfile
