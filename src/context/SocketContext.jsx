import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'
import { API_URL, getToken, getCurrentUser, authHeaders } from '../lib/api'

const SocketContext = createContext(null)

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])
  const token = getToken()

  useEffect(() => {
    if (!token) return undefined

    const instance = io(API_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      // Delay connecting until after mount so React StrictMode's dev-only
      // mount/unmount/remount does not abort a half-open websocket.
      autoConnect: false,
    })

    const handleConnect = () => {
      setConnected(true)
      const me = getCurrentUser()
      if (me?.id) instance.emit('join', me.id)
      fetchOnlineUsers()
    }
    const handleDisconnect = () => {
      setConnected(false)
      setOnlineUsers([])
    }
    const handleOnlineUsers = (ids) =>
      setOnlineUsers(Array.isArray(ids) ? ids.map(String) : [])
    const handleError = (error) => console.error('Socket connection error:', error.message)

    // REST fallback so presence still works if the socket broadcast is missed
    // (background tab, reconnect, or a cold Render instance).
    const fetchOnlineUsers = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/users/online`, {
          headers: authHeaders(),
          withCredentials: true,
        })
        handleOnlineUsers(data?.onlineUsers)
      } catch {
        // Presence is best-effort; the socket broadcast remains the main path.
      }
    }

    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') return
      const me = getCurrentUser()
      if (me?.id && instance.connected) instance.emit('join', me.id)
      fetchOnlineUsers()
    }

    instance.on('connect', handleConnect)
    instance.on('disconnect', handleDisconnect)
    instance.on('online_users', handleOnlineUsers)
    instance.on('connect_error', handleError)
    setSocket(instance)

    const connectTimer = setTimeout(() => instance.connect(), 0)
    fetchOnlineUsers()
    const onlineTimer = window.setInterval(fetchOnlineUsers, 10000)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearTimeout(connectTimer)
      window.clearInterval(onlineTimer)
      document.removeEventListener('visibilitychange', handleVisibility)
      instance.off('connect', handleConnect)
      instance.off('disconnect', handleDisconnect)
      instance.off('online_users', handleOnlineUsers)
      instance.off('connect_error', handleError)
      instance.disconnect()
      setSocket(null)
      setConnected(false)
      setOnlineUsers([])
    }
  }, [token])

  const value = useMemo(
    () => ({ socket, connected, onlineUsers }),
    [socket, connected, onlineUsers]
  )

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export const useSocket = () => useContext(SocketContext)
