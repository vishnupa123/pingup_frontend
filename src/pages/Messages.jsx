import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaHouseUser } from 'react-icons/fa'
import axios from 'axios'
import { useNotifications } from '../context/NotificationContext'
import { API_URL, authHeaders, getCurrentUser } from '../lib/api'

const Messages = () => {
  const navigate = useNavigate()
  const { users, counts, totalUnread, markSeen, loading } = useNotifications()
  const [friends, setFriends] = useState([])
  const me = getCurrentUser()

  useEffect(() => {
    const loadFriends = async () => {
      if (!me?.id) return
      try {
        const { data } = await axios.get(`${API_URL}/api/users`, { headers: authHeaders() })
        const all = Array.isArray(data) ? data : []
        const meData = all.find((u) => String(u._id) === String(me.id))
        const following = new Set((meData?.following || []).map((id) => String(id?._id || id)))
        const followers = new Set((meData?.followers || []).map((id) => String(id?._id || id)))
        const mutual = all.filter((u) => {
          const id = String(u._id)
          return id !== String(me.id) && following.has(id) && followers.has(id)
        })
        setFriends(mutual)
      } catch {
        setFriends([])
      }
    }
    loadFriends()
  }, [me?.id])

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
            <div className='py-4'>
              {friends.length > 0 ? (
                <div className='mb-4'>
                  <p className='text-sm font-medium text-gray-700 mb-3'>Friends</p>
                  <div className='flex gap-4 overflow-x-auto no-scrollbar pb-2'>
                    {friends.map((friend) => {
                      const id = friend._id || friend.id
                      return (
                        <button
                          key={id}
                          type='button'
                          onClick={() => navigate(`/profile/${id}`)}
                          className='flex flex-col items-center gap-2 shrink-0 cursor-pointer'
                        >
                          <img
                            src={friend.profilePic || friend.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.fullName || friend.username || 'User')}`}
                            alt={friend.fullName || friend.username}
                            className='w-14 h-14 rounded-full object-cover border border-gray-200'
                          />
                          <span className='text-[11px] text-gray-600 w-16 truncate text-center'>{friend.username || friend.fullName || 'User'}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className='text-center py-6'>
                  <p className='text-gray-400 text-sm mb-3'>No friends yet. Discover people to follow.</p>
                  <button
                    type='button'
                    onClick={() => navigate('/discover')}
                    className='px-4 py-2 bg-pink-500 text-white text-sm rounded-lg hover:bg-pink-600 transition cursor-pointer'
                  >
                    Go to Discover
                  </button>
                </div>
              )}
              <p className='text-center text-gray-400 py-4 text-sm'>
                No conversations yet. Follow each other to start chatting.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Messages
