import React, { useEffect, useState } from 'react'
import {
  Users,
  UserPlus,
  UserCheck,
  X,
  MessageCircle,
  Check,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Loading from '../components/Loading'
import toast from 'react-hot-toast'
import { useNotifications } from '../context/NotificationContext'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const Connection = () => {
  const navigate = useNavigate()
  const { markAppReadByType } = useNotifications()
  const [currentTab, setCurrentTab] = useState('Followers')
  const [followers, setFollowers] = useState([])
  const [followings, setFollowings] = useState([])
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    markAppReadByType('follow')
  }, [markAppReadByType])

  const fetchUserObject = async (userItem) => {
    if (!userItem) return null
    
    // If it's already a full user object, return it
    if (typeof userItem !== 'string' && userItem._id && userItem.username) {
      return userItem
    }
    
    // Extract ID if it's a string
    const userId = typeof userItem === 'string' ? userItem : userItem._id
    
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return res.data.user || null
    } catch (error) {
      console.warn('Unable to fetch user profile for', userId, error)
      return null
    }
  }

  const normalizeUserList = async (list = []) => {
    const normalized = await Promise.all(
      list.map(async (item) => await fetchUserObject(item))
    )
    return normalized.filter(Boolean)
  }

  const fetchProfileConnections = async () => {
    const token = localStorage.getItem('token')
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const user = res.data.user
      const meId = String(user._id || user.id || '')

      const [followersData, followingsData] = await Promise.all([
        normalizeUserList(user.followers || []),
        normalizeUserList(user.following || [])
      ])

      // A "connection" is a mutual follow: they follow you and you follow them.
      const connectionsData = followingsData.filter((following) =>
        String(following._id) !== meId &&
        followersData.some((follower) => String(follower._id) === String(following._id))
      )

      setFollowers(followersData)
      setFollowings(followingsData)
      setConnections(connectionsData)
    } catch (err) {
      console.error('Error fetching profile connections:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfileConnections()
  }, [])

  const handleUnfollow = async (userId) => {
    const token = localStorage.getItem('token')
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/follow/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setFollowings(prev => prev.filter(u => String(u._id) !== String(userId)))
      setConnections(prev => prev.filter(u => String(u._id) !== String(userId)))
      toast.success('Unfollowed successfully')
    } catch (err) {
      console.error('Unfollow failed:', err)
      toast.error('Failed to unfollow')
    }
  }

  const handleFollowBack = async (userId) => {
    const token = localStorage.getItem('token')
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/follow/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const followedUser = followers.find(u => String(u._id) === String(userId))
      setFollowings(prev =>
        prev.some(u => String(u._id) === String(userId)) || !followedUser
          ? prev
          : [...prev, followedUser]
      )
      // They already follow you, so following back makes them a connection.
      setConnections(prev =>
        prev.some(u => String(u._id) === String(userId)) || !followedUser
          ? prev
          : [...prev, followedUser]
      )
      toast.success('Followed back!')
    } catch (err) {
      console.error('Follow back failed:', err)
      toast.error('Failed to follow back')
    }
  }

  const dataArray = [
    { label: 'Followers', value: followers, icon: Users },
    { label: 'Following', value: followings, icon: UserCheck },
    { label: 'Connections', value: connections, icon: UserPlus }
  ]

  const currentData = dataArray.find(item => item.label === currentTab)?.value

  // Graph data using followers and following
  const graphData = [
    { name: 'Followers', count: followers.length, fill: '#ec4899' },
    { name: 'Following', count: followings.length, fill: '#3b82f6' },
    { name: 'Connections', count: connections.length, fill: '#a855f7' },
  ]

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[60vh]'>
        <Loading />
      </div>
    )
  }

  return (
    <div className='flex'>
      <div className='max-w-5xl w-full bg-white p-6 rounded-2xl'>

        {/* Title */}
        <div className='mb-6'>
          <h1 className='text-2xl font-semibold theme-gradient-text'>Connections</h1>
          <p className='text-sm text-gray-500'>Manage your connections easily</p>
        </div>

        {/* Graph + Stats Side by Side */}
        <div className='flex flex-col sm:flex-row gap-4 mb-6'>

          {/* Bar Chart */}
          <div className='flex-1 bg-blue-50 rounded-2xl p-4'>
            <p className='text-sm font-semibold text-gray-600 mb-3'>Network Overview</p>
            <ResponsiveContainer width='100%' height={180}>
              <BarChart data={graphData} barSize={40}>
                <XAxis dataKey='name' tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                  cursor={{ fill: 'transparent' }}
                />
                <Bar dataKey='count' radius={[6, 6, 0, 0]}>
                  {graphData.map((entry, index) => (
                    <rect key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Stats Cards */}
          <div className='flex sm:flex-col gap-3 justify-between sm:justify-start'>
            {dataArray.map((item, index) => {
              const Icon = item.icon
              const colors = ['text-pink-500 bg-pink-50', 'text-blue-500 bg-blue-50', 'text-purple-500 bg-purple-50']
              return (
                <div
                  key={index}
                  onClick={() => setCurrentTab(item.label)}
                  className={`cursor-pointer rounded-xl px-5 py-3 flex flex-col items-center justify-center hover:shadow-md transition flex-1 sm:flex-none ${colors[index].split(' ')[1]}`}
                >
                  <Icon className={`w-5 h-5 mb-1 ${colors[index].split(' ')[0]}`} />
                  <b className={`text-lg ${colors[index].split(' ')[0]}`}>{item.value.length}</b>
                  <p className='text-xs text-gray-500 text-center'>{item.label}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className='mt-2 flex flex-wrap gap-2 p-2 rounded-md'>
          {dataArray.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.label}
                onClick={() => setCurrentTab(tab.label)}
                className={`flex items-center px-3 py-1 rounded-md text-sm transition cursor-pointer
                  ${currentTab === tab.label
                    ? 'bg-blue-600 text-white text-xs'
                    : 'text-gray-500 hover:text-black'
                  }`}
              >
                <Icon className='w-4 h-4 mr-1' />
                {tab.label}
                <span className='ml-1'>({tab.value.length})</span>
              </button>
            )
          })}
        </div>

        {/* Users List - Grid View */}
        <div className='mt-8'>
          <h2 className='text-lg font-semibold text-gray-700 mb-4'>
            {currentTab} ({currentData?.length || 0})
          </h2>
          
          {currentData?.length === 0 && (
            <p className='text-sm text-gray-400 text-center py-8'>
              {currentTab === 'Connections'
                ? 'No connections yet. Follow each other to connect and chat.'
                : `No ${currentTab.toLowerCase()} yet.`}
            </p>
          )}

          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'>
            {currentData?.map((userItem) => {
              const user = typeof userItem === 'string'
                ? { _id: userItem, username: userItem, full_name: userItem }
                : userItem
              const profilePic = user.profile_picture || user.profilePic || 'https://via.placeholder.com/150'
              const fullName = user.full_name || user.fullName || user.username || 'User'
              const username = user.username || 'user'

              return (
                <div
                  key={user._id}
                  className='group p-3 bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 hover:shadow-md hover:border-pink-300 transition-all duration-300'
                >
                  {/* Profile Section */}
                  <div
                    onClick={() => navigate(`/profile/${user._id}`)}
                    className='flex flex-col items-center cursor-pointer'
                  >
                    <div className='relative mb-2'>
                      <img
                        src={profilePic}
                        alt={fullName}
                        className='rounded-full w-14 h-14 object-cover border-3 border-pink-200 shadow-sm group-hover:scale-105 transition-transform'
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150' }}
                      />
                    </div>
                    
                    {/* User Info */}
                    <div className='text-center w-full'>
                      <h3 className='font-bold text-gray-800 text-xs truncate group-hover:text-pink-500 transition line-clamp-1'>
                        {fullName}
                      </h3>
                      <p className='text-xs text-pink-500 font-semibold truncate'>@{username}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className='flex gap-1.5 justify-center mt-3'>
                    {currentTab === 'Followers' && (
                      followings.some(f => String(f._id) === String(user._id)) ? (
                        <span className='flex-1 p-1.5 rounded-md bg-purple-50 text-purple-600 font-semibold text-xs flex items-center justify-center gap-1'>
                          <Check size={14} />
                          Connected
                        </span>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleFollowBack(user._id) }}
                          className='flex-1 p-1.5 cursor-pointer bg-green-500 text-white rounded-md hover:bg-green-600 transition font-semibold text-xs flex items-center justify-center gap-1'
                          title='Follow back'
                        >
                          <Check size={14} />
                          Follow
                        </button>
                      )
                    )}

                    {currentTab === 'Following' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUnfollow(user._id) }}
                        className='flex-1 p-1.5 cursor-pointer bg-red-500 text-white rounded-md hover:bg-red-600 transition font-semibold text-xs flex items-center justify-center gap-1'
                        title='Unfollow'
                      >
                        <X size={14} />
                        Unfollow
                      </button>
                    )}

                    {currentTab === 'Connections' && (
                      <>
                        <button
                          onClick={() => navigate(`/messages/${user._id}`)}
                          className='flex-1 p-1.5 cursor-pointer bg-pink-500 text-white rounded-md hover:bg-pink-600 transition font-semibold text-xs flex items-center justify-center'
                          title='Message'
                        >
                          <MessageCircle size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUnfollow(user._id) }}
                          className='flex-1 p-1.5 cursor-pointer bg-red-500 text-white rounded-md hover:bg-red-600 transition font-semibold text-xs flex items-center justify-center'
                          title='Remove connection'
                        >
                          <X size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}

export default Connection