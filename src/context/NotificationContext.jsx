import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { API_URL, authHeaders, isMutualFollow } from '../lib/api'
import { countUnread, markConversationSeen } from '../lib/unread'
import { playReceiveSound } from '../lib/sound'
import { useSocket } from './SocketContext'
import { useMe } from './UserContext'

const NotificationContext = createContext(null)

export const NotificationProvider = ({ children }) => {
  const { socket } = useSocket()
  const me = useMe()
  const [users, setUsers] = useState([])
  const [counts, setCounts] = useState({})
  const [previews, setPreviews] = useState({})
  const [loading, setLoading] = useState(true)

  // Depends on the whole user object: right after login localStorage only has
  // id/name, and UserProvider replaces it with followers/following once
  // /api/users/me resolves. That update must trigger a fresh computation.
  const refresh = useCallback(async () => {
    if (!me?.id) return
    try {
      const { data } = await axios.get(`${API_URL}/api/messages/conversations/users`, {
        headers: authHeaders(),
        withCredentials: true,
      })
      const all = Array.isArray(data) ? data : Array.isArray(data?.users) ? data.users : []
      const mutualUsers = all.filter((user) => isMutualFollow(me, user))

      const results = await Promise.all(mutualUsers.map(async (user) => {
        const id = user._id || user.id
        try {
          const { data: messages } = await axios.get(`${API_URL}/api/messages/${id}`, {
            headers: authHeaders(),
            withCredentials: true,
          })
          const list = Array.isArray(messages) ? messages : []
          return {
            id,
            last: list.length ? list[list.length - 1] : null,
            unread: countUnread(list, me.id, id),
          }
        } catch {
          return { id, last: null, unread: 0 }
        }
      }))

      const nextCounts = {}
      const nextPreviews = {}
      results.forEach(({ id, last, unread }) => {
        nextCounts[id] = unread
        nextPreviews[id] = last
      })

      setUsers(mutualUsers)
      setCounts(nextCounts)
      setPreviews(nextPreviews)
    } catch (error) {
      console.error('Error loading message notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [me])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Live incoming messages increase the badge and update the preview.
  useEffect(() => {
    if (!socket || !me?.id) return undefined

    const onReceive = (msg) => {
      const fromMe = String(msg?.sender) === String(me.id)
      const otherId = String(fromMe ? msg?.receiver : msg?.sender)
      if (!otherId || otherId === 'undefined') return

      setPreviews((prev) => ({ ...prev, [otherId]: msg }))
      if (!fromMe) {
        setCounts((prev) => ({ ...prev, [otherId]: (prev[otherId] || 0) + 1 }))
        playReceiveSound()
      }
    }

    socket.on('receive_message', onReceive)
    return () => socket.off('receive_message', onReceive)
  }, [socket, me?.id])

  const markSeen = useCallback((conversationId) => {
    if (!conversationId) return
    markConversationSeen(conversationId)
    setCounts((prev) => ({ ...prev, [conversationId]: 0 }))
  }, [])

  const totalUnread = Object.values(counts).reduce((sum, n) => sum + (n || 0), 0)

  const value = useMemo(
    () => ({ users, counts, previews, totalUnread, markSeen, refresh, loading }),
    [users, counts, previews, totalUnread, markSeen, refresh, loading]
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export const useNotifications = () => useContext(NotificationContext)
