import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaHouseUser } from 'react-icons/fa'
import { useNotifications } from '../context/NotificationContext'

const Messages = () => {
  const navigate = useNavigate()
  const { users, counts, totalUnread, markSeen, loading } = useNotifications()

  const openChat = (id) => {
    markSeen(id) // clears this conversation's notification
    navigate(`/messages/${id}`)
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-slate-100 text-gray-400 text-sm flex items-center justify-center'>
        Loading chats...
      </div>
    )
  }

  return (
    <div className='min bg-slate-100'>
      <div className='max-w-5xl w-full bg-white rounded-xl shadow-sm'>
        <div className='mb-6'>
          <h1 className='text-2xl font-semibold text-blue-600'>Messages</h1>
          <p className='text-sm text-gray-500'>Talk to Your Friends and Family</p>
          {totalUnread > 0 && (
            <p className='mt-1 text-xs text-pink-500'>{totalUnread} unread {totalUnread === 1 ? 'message' : 'messages'}</p>
          )}
        </div>

        <div className='space-y-3 cursor-pointer'>
          {users.length > 0 ? (
            users.map((user) => {
              const id = user._id || user.id
              const unread = counts[id] || 0

              return (
                <div
                  key={id}
                  onClick={() => openChat(id)}
                  className='flex items-center gap-4 p-4 rounded-lg border border-transparent hover:shadow-sm hover:bg-slate-50 hover:border-gray-100 transition'
                >
                  <div className='relative shrink-0'>
                    <img
                      src={user.profilePic || user.profile_picture || 'https://via.placeholder.com/150'}
                      alt={user.fullName || user.full_name || user.username}
                      className='w-14 h-14 rounded-full object-cover border border-gray-100'
                    />
                    {unread > 0 && (
                      <span className='absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-0.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-semibold leading-none shadow'>
                        {unread > 99 ? '99+' : unread}
                      </span>
                    )}
                  </div>

                  <div className='flex-1'>
                    <p className='font-semibold text-gray-800'>
                      {user.fullName || user.full_name || user.username}
                    </p>
                    <p className='text-xs text-gray-400'>@{user.username}</p>
                  </div>

                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/profile/${id}`)
                    }}
                    className='p-2 rounded-full bg-slate-200 hover:bg-slate-300 transition cursor-pointer'
                  >
                    <FaHouseUser className='text-pink-500 text-sm' />
                  </button>
                </div>
              )
            })
          ) : (
            <p className='text-center text-gray-400 py-8 text-sm'>
              No conversations yet. Follow each other to start chatting.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Messages
