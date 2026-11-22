import React from 'react'
import { Link } from 'react-router-dom'
import { useNotifications } from '../context/NotificationContext'

const RecentMsg = () => {
  const { users, counts, previews, markSeen } = useNotifications()

  return (
    <div className="p-3 bg-white rounded-2xl shadow-sm">
      <div className='flex items-center justify-between mb-3'>
        <h3 className="font-bold text-md text-gray-900">Messages</h3>
        {users.length > 0 && (
          <Link to='/messages' className='text-[11px] text-pink-500 hover:underline'>View all</Link>
        )}
      </div>

      <div className='flex flex-col gap-2'>
        {users.length > 0 ? users.map((user) => {
          const id = user._id || user.id
          const name = user.fullName || user.full_name || user.username
          const avatar = user.profilePic || user.profile_picture || 'https://via.placeholder.com/150'
          const last = previews[id]
          const unread = counts[id] || 0

          return (
            <Link
              key={id}
              to={`/messages/${id}`}
              onClick={() => markSeen(id)}
              className="hover:bg-slate-50 p-2 rounded-xl transition-colors flex items-center gap-2"
            >
              <div className="relative shrink-0">
                <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                {unread > 0 && (
                  <span className='absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold shadow'>
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-sm text-gray-800 truncate">{name}</h4>
                  {last?.createdAt && (
                    <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                      {new Date(last.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <p className={`text-xs truncate ${unread > 0 ? 'text-gray-700 font-semibold' : 'text-gray-500'}`}>
                  {last?.message || 'Tap to start chatting'}
                </p>
              </div>
            </Link>
          )
        }) : (
          <p className="text-xs text-gray-400 text-center py-3">No conversations yet.</p>
        )}
      </div>
    </div>
  )
}

export default RecentMsg
