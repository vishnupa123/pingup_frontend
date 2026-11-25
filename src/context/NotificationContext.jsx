import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { API_URL, authHeaders, isMutualFollow } from '../lib/api'
import { countUnread, getLastSeen, markConversationSeen } from '../lib/unread'
import { playReceiveSound } from '../lib/sound'
import { useSocket } from './SocketContext'
import { useMe } from './UserContext'

const NotificationContext = createContext(null)

export const NotificationProvider = ({ children }) => {
  const { socket } = useSocket()
  const me = useMe()
  const [users, setUsers] = useState([])
  const usersRef = useRef(new Set())
  const [counts, setCounts] = useState({})
  const [previews, setPreviews] = useState({})
  const [loading, setLoading] = useState(true)
  const [appNotifications, setAppNotifications] = useState([])

  // Depends on the whole user object: right after login localStorage only has
  // id/name, and UserProvider replaces it with followers/following once
  // /api/users/me resolves. That update must trigger a fresh computation.
  const addConversationUser = useCallback(async (otherId) => {
    if (!me?.id || !otherId) return
    const id = String(otherId)
    if (usersRef.current.has(id)) return
    usersRef.current.add(id)

    try {
      const { data } = await axios.get(`${API_URL}/api/users/profile/${id}`, {
        headers: authHeaders(),
        withCredentials: true,
      })
      const user = data?.user
      if (user && isMutualFollow(me, user)) {
        setUsers((prev) =>
          prev.some((item) => String(item._id || item.id) === id) ? prev : [...prev, user]
        )
      }
    } catch {
      // Keep the badge/count even if the profile lookup fails.
    }
  }, [me])

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

          // Migrate conversations that were seen before seenAt was stored on
          // the server, then rely on Message.seenAt from here on.
          const localSeenAt = getLastSeen(id, me.id)
          if (localSeenAt) {
            let migrated = false
            list.forEach((msg) => {
              const sentAt = new Date(msg?.createdAt || 0).getTime()
              if (
                String(msg?.sender) !== String(me.id) &&
                !msg?.seenAt &&
                sentAt <= localSeenAt
              ) {
                msg.seenAt = new Date(localSeenAt).toISOString()
                migrated = true
              }
            })
            if (migrated) {
              axios
                .post(
                  `${API_URL}/api/messages/seen/${id}`,
                  {},
                  { headers: authHeaders(), withCredentials: true }
                )
                .catch(() => {})
            }
          }

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
      usersRef.current = new Set(mutualUsers.map((user) => String(user._id || user.id)))
      setCounts(nextCounts)
      setPreviews(nextPreviews)
    } catch (error) {
      console.error('Error loading message notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [me])

  const refreshAppNotifications = useCallback(async () => {
    if (!me?.id) return
    try {
      const { data } = await axios.get(`${API_URL}/api/notifications`, { headers: authHeaders() })
      setAppNotifications(Array.isArray(data) ? data : [])
    } catch {
      setAppNotifications([])
    }
  }, [me?.id])

  useEffect(() => {
    refresh()
    refreshAppNotifications()
  }, [refresh, refreshAppNotifications])

  // Keep badges and the conversation list in sync if a socket event is missed.
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') refresh()
    }, 15000)
    return () => window.clearInterval(timer)
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
        addConversationUser(otherId)
        playReceiveSound()
      }
    }

    const onAppNotification = (n) => {
      setAppNotifications((prev) => [n, ...prev].slice(0, 30))
    }

    socket.on('receive_message', onReceive)
    socket.on('notification', onAppNotification)
    return () => {
      socket.off('receive_message', onReceive)
      socket.off('notification', onAppNotification)
    }
  }, [socket, me?.id, addConversationUser])

  const markSeen = useCallback((conversationId) => {
    if (!conversationId) return
    markConversationSeen(conversationId, me?.id)
    setCounts((prev) => ({ ...prev, [conversationId]: 0 }))
  }, [me?.id])

  const markAppReadByType = useCallback(async (type) => {
    try {
      const unreadIds = appNotifications.filter((n) => !n.read && (!type || n.type === type)).map((n) => n._id)
      if (unreadIds.length === 0) return
      await Promise.all(unreadIds.map((id) => axios.patch(`${API_URL}/api/notifications/${id}/read`, {}, { headers: authHeaders() })))
      setAppNotifications((prev) => prev.map((n) => (!type || n.type === type ? { ...n, read: true } : n)))
    } catch {}
  }, [appNotifications])

  const totalUnread = Object.values(counts).reduce((sum, n) => sum + (n || 0), 0)
  const postUnread = appNotifications.filter((n) => n.type === 'post' && !n.read).length
  const followUnread = appNotifications.filter((n) => n.type === 'follow' && !n.read).length

  const value = useMemo(
    () => ({ users, counts, previews, totalUnread, markSeen, refresh, loading, appNotifications, postUnread, followUnread, markAppReadByType, refreshAppNotifications }),
    [users, counts, previews, totalUnread, markSeen, refresh, loading, appNotifications, postUnread, followUnread, markAppReadByType, refreshAppNotifications]
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export const useNotifications = () => useContext(NotificationContext)
