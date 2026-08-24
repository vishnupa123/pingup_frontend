import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaHouseUser } from 'react-icons/fa'

const Messages = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchChatList = async () => {
      try {
        const token = localStorage.getItem('token')

        const headers = {
          'Content-Type': 'application/json',
        }

        if (token) headers['Authorization'] = `Bearer ${token}`

        const res = await fetch('/api/messages/conversations/users', {
          method: 'GET',
          credentials: 'include',
          headers,
        })

        if (!res.ok) {
          const text = await res.text().catch(() => '')
          throw new Error(`HTTP error! status: ${res.status}${text ? ` - ${text}` : ''}`)
        }

        const data = await res.json()
        
        if (Array.isArray(data)) {
          setUsers(data)
        } else if (Array.isArray(data?.users)) {
          setUsers(data.users)
        } else {
          setUsers([])
        }
        setLoading(false)
      } catch (fetchError) {
        console.error('Error fetching chat list:', fetchError)
        setError(fetchError?.message || 'Failed to connect to server. Please check if backend is running.')
        setUsers([])
        setLoading(false)
      }
    }

    fetchChatList()
  }, [])

  if (loading) {
    return (
      <div className='min-h-screen  bg-slate-100 text-gray-400 text-sm'>
        Loading chats...
      </div>
    )
  }

  return (
    <div className='min bg-slate-100  '>
      <div className='max-w-5xl w-full bg-white rounded-xl  shadow-sm'>
        <div className='mb-6'>
          <h1 className='text-2xl font-semibold text-blue-600'>Messages</h1>
          <p className='text-sm text-gray-500'>Talk to Your Friends and Family</p>
          {error && (
            <p className='mt-2 text-sm text-red-500'>{error}</p>
          )}
        </div>

        <div className='space-y-3 cursor-pointer'>
          {users.length > 0 ? (
            users.map((user) => (
              <div
                key={user._id || user.id}
                onClick={() => navigate(`/messages/${user._id || user.id}`)}
                className='flex items-center gap-4 p-4 rounded-lg border border-transparent hover:shadow-sm hover:bg-slate-50 hover:border-gray-100 transition'
              >
                <img
                  src={user.profilePic || user.profile_picture || 'https://via.placeholder.com/150'}
                  alt={user.full_name || user.username}
                  className='w-14 h-14 rounded-full object-cover border border-gray-100'
                />

                <div className='flex-1'>
                  <p className='font-semibold text-gray-800'>{user.full_name || user.username}</p>
                  <p className='text-xs text-gray-400'>@{user.username}</p>
                </div>

                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/profile/${user._id || user.id}`)
                  }}
                  className='p-2 rounded-full bg-slate-200 hover:bg-slate-300 transition cursor-pointer'
                >
                  <FaHouseUser className='text-pink-500 text-sm' />
                </button>
              </div>
            ))
          ) : (
            <p className='text-center text-gray-400 py-8 text-sm'>No conversations found.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Messages