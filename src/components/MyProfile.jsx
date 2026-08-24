import React from 'react'

const timeAgo = (iso) => {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const initials = (name) =>
  name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'

const MyProfile = ({ posts = [] }) => {

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
        const likesCount = Array.isArray(item?.likes) ? item.likes.length : 0
        const commentsCount = Array.isArray(item?.comments) ? item.comments.length : item?.comments || 0

        return (
          <div key={item?._id || index} className='py-5 pr-4 hover:bg-slate-50/30 transition-colors duration-150'>

            {/* Header */}
            <div className='flex items-center gap-3 mb-3 mt-4'>
              {item?.user?.profile_picture ? (
                <img
                  src={item.user.profile_picture}
                  alt={item.user.full_name}
                  className='w-10 h-10 rounded-full object-cover'
                />
              ) : (
                <div className='w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-500'>
                  {initials(item?.user?.full_name || 'Anonymous')}
                </div>
              )}
              <div className='flex flex-col'>
                <span className='text-sm font-semibold text-gray-900'>
                  {item?.user?.full_name || 'Anonymous'}
                </span>
                <span className='text-xs text-gray-500'>
                  @{item?.user?.username || 'user'}
                </span>
              </div>
              {item?.createdAt && (
                <span className='ml-auto text-xs text-gray-500'>
                  {timeAgo(item.createdAt)}
                </span>
              )}
            </div>

            {/* Content */}
            {item?.content && (
              <p className='text-sm text-gray-800 mb-3 leading-relaxed whitespace-pre-line'>
                {item.content}
              </p>
            )}

            {/* Image */}
            {item?.image && (
              <div className='w-full rounded-xl overflow-hidden max-h-80 mb-3 border border-gray-100 bg-slate-50/50'>
                <img
                  src={item.image}
                  alt='post media'
                  className='w-full h-full object-cover'
                />
              </div>
            )}

            {/* Actions */}
            <div className='flex items-center gap-5 pt-1'>
              <button
                className={`flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-colors ${
                  item?.likedByMe ? 'text-pink-500 hover:text-pink-600' : 'text-gray-500 hover:text-gray-600'
                }`}
              >
                <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4' fill={item?.likedByMe ? 'currentColor' : 'none'} viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z' />
                </svg>
                <span>{likesCount}</span>
              </button>

              <button className='flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-600 cursor-pointer transition-colors'>
                <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' />
                </svg>
                <span>{commentsCount}</span>
              </button>

              <button className='flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-600 cursor-pointer transition-colors ml-auto'>
                <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z' />
                </svg>
              </button>
            </div>

          </div>
        )
      })}
    </div>
  )
}

export default MyProfile