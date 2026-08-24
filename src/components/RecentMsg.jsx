import React, { useEffect, useState } from 'react'
import { dummyMessagesData } from '../assets/assets'
import { Link } from 'react-router-dom'
import moment from 'moment'
import { Check, CheckCheck } from 'lucide-react'

const RecentMsg = () => {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    setMessages(dummyMessagesData)
  }, [])

  return (
    <div className="p-3 bg-white rounded-2xl shadow-sm">
      <h3 className="font-bold text-md mb-3 text-gray-900">Messages</h3>

      <div className='flex flex-col gap-2'>
        {messages.map((message, index) => (
          <Link key={index} to={`/messages/${message.from_user_id._id}`}
            className="hover:bg-slate-50 p-2 rounded-xl transition-colors flex items-center gap-2">

            {/* Avatar - Reduced size to w-10 */}
            <div className="relative shrink-0">
              <img
                src={message.from_user_id.profile_picture}
                alt={message.from_user_id.full_name}
                className="w-10 h-10 rounded-full object-cover border border-gray-100"
              />
              {message.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-[9px] w-4 h-4 flex items-center justify-center rounded-full border border-white text-white font-bold">
                  {message.unreadCount}
                </span>
              )}
            </div>

            {/* Text Content - Tighter spacing */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-sm text-gray-900 truncate">
                  {message.from_user_id.full_name}
                </h4>
                <span className="text-[10px] text-gray-400">
                  {moment(message.updatedAt).format('HH:mm')}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {message.unreadCount === 0 ? (
                  <CheckCheck size={12} className="text-blue-500 shrink-0" />
                ) : (
                  <Check size={12} className="text-gray-400 shrink-0" />
                )}
                <p className={`text-xs truncate ${message.unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                  {message.lastMessage}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default RecentMsg